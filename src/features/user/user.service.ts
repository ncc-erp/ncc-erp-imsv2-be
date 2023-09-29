import { User } from '@entities/user.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { USER_UNIQUE_CONSTRAINTS } from '@common/constants/imsv1.constant';
import {
  ArrayContainedBy,
  ArrayOverlap,
  FindManyOptions,
  FindOptionsWhere,
  In,
  Like,
  Repository,
} from 'typeorm';
import { RoleService } from '@features/role/role.service';
import { UserFilter } from './dto/user-filter.dto';
import { PageableDTO } from '@/common/dto/pageable.dto';
import { Hrmv2Service } from '../hrmv2/hrmv2.service';
import { ClsService } from 'nestjs-cls';
import { BaseService } from '@features/base/base.service';
import { FilesService } from '@features/files/files.service';

@Injectable()
export class UserService extends BaseService<User> {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly roleService: RoleService,
    private readonly hrmService: Hrmv2Service,
    private readonly clsService: ClsService,
    private readonly filesService: FilesService,
  ) {
    super(userRepository, User);
  }

  count() {
    return this.userRepository.count({});
  }

  async findOneWhere(filter: FindOptionsWhere<User>) {
    return this.userRepository.findOne({
      where: filter,
    });
  }

  async getAllUsers(filter: UserFilter) {
    const { search: name, role: roleId } = filter;

    let where = {
      roles: {
        id: roleId === -1 ? undefined : roleId,
      },
    } as FindOptionsWhere<User> | FindOptionsWhere<User>[];

    if (name) {
      where = [
        {
          ...where,
          name: Like(`%${name}%`),
        },
        {
          ...where,
          userName: Like(`%${name}%`),
        },
      ];
    }

    // Get list of user's ids which have the role = roleId
    const userIds = (await this.findMany(where)).map((user) => user.id);

    const findOptions: FindManyOptions<User> = {
      where: {
        id: In(userIds),
      },
      order: {
        [filter.orderBy ?? 'id']: filter.order ?? 'ASC',
      },
      skip: filter.skip ?? 0,
      take: filter.size ?? 10,
    };

    const [result, count] = await this.userRepository.findAndCount(findOptions);
    return new PageableDTO<User>(result, {
      itemCount: count,
      pageOptionsDTO: filter,
    });
  }

  findMany(filter: FindOptionsWhere<User> | FindOptionsWhere<User>[]) {
    return this.userRepository.find({
      where: filter,
    });
  }

  async add(data: User[]) {
    return this.userRepository.save(data);
  }

  async upsert(data: User[]) {
    return this.userRepository.upsert(data, USER_UNIQUE_CONSTRAINTS);
  }

  async deleteBy(filter: FindOptionsWhere<User>) {
    return this.userRepository.delete(filter);
  }

  // Replace old role with new role array
  async updateRoles(whereFilter: FindOptionsWhere<User>, roleNames: string[]) {
    const u = this.userRepository.findOne({
      where: whereFilter,
    });
    const r = this.roleService.getManyRole({
      where: {
        name: In(roleNames),
      },
    });

    const [user, roles] = await Promise.all([u, r]);

    if (!user) throw new BadRequestException('User not existed');

    const invalidRoles: string[] = [];
    roleNames.forEach((roleName) => {
      if (!roles.find((role) => role.name === roleName))
        invalidRoles.push(roleName);
      return;
    });

    if (invalidRoles.length)
      throw new BadRequestException(`Roles not existed: ${invalidRoles}`);

    user.roles = roles;

    return this.userRepository.save(user);
  }

  async getUserTeamIds(emailAddress: string) {
    const userInfo = await this.hrmService.getUserInfoByEmail(emailAddress);
    return userInfo?.teamIds ?? [];
  }

  getCurrentUser() {
    return this.clsService.get<User>('user');
  }

  async getFindWhereWithUserTeamPermission<T>(where: FindOptionsWhere<T>) {
    const currentUser = this.getCurrentUser();

    const isAdmin = currentUser.roles.some((role) => role.name === 'Admin');
    if (isAdmin) return where;

    const userTeamIds = await this.getUserTeamIds(currentUser.emailAddress);
    const whereClause: FindOptionsWhere<T>[] = [
      {
        ...where,
        teamIds: ArrayOverlap(userTeamIds),
      },
      {
        ...where,
        teamIds: ArrayContainedBy([]),
      },
    ];
    return whereClause;
  }

  async getAllUserEmailsForSync() {
    const users = await this.userRepository.find({
      select: {
        emailAddress: true,
      },
    });
    return users.map((user) => user.emailAddress);
  }

  async uploadAvatar(avatar: Express.Multer.File) {
    const user = this.getCurrentUser();
    user.avatar = await this.filesService.getImagesKeys(avatar, user.avatar);
    await this.save(user);
  }
}
