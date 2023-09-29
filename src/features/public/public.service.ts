import { QuickNews } from '@/entities/quicknews.entity';
import { User } from '@/entities/user.entity';
import { LoggerService } from '@/logger/logger.service';
import { RoleName } from '@/types/authorization/role.enum';
import {
  EmployeeStatus,
  JobPosition,
  UserType,
} from '@/types/hrmv2/hrmv2.enum';
import { CMSService } from '@features/cms/cms.service';
import { Hrmv2Service } from '@features/hrmv2/hrmv2.service';
import { RoleService } from '@features/role/role.service';
import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrUpdateUserDTO } from './dto/create-or-update-user.dto';
import { UserDTO } from '@features/user/dto/user.dto';

@Injectable()
export class PublicService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly cmsService: CMSService,
    private readonly hrmv2Service: Hrmv2Service,
    private readonly roleService: RoleService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(PublicService.name);
  }

  async createQuickNews(content: string) {
    if (!content) {
      throw new BadGatewayException('Content is not empty');
    }
    const quickNews = new QuickNews();
    quickNews.description = content;

    return await this.cmsService.insertSingleQNews(quickNews);
  }

  buildRoleByUserInfo(userType: UserType, jobPosition: string) {
    switch (userType) {
      case UserType.Staff:
      case UserType.ProbationaryStaff:
      case UserType.Collaborators:
        if (jobPosition === JobPosition.IT) {
          return RoleName.ADMIN;
        }
        if (jobPosition === JobPosition.HR) {
          return RoleName.HR;
        }
        return RoleName.STAFF;
      case UserType.Vendor:
      case UserType.Internship:
        return RoleName.INTERN;
      default:
        return RoleName.STAFF;
    }
  }

  async createUserFromHrm(input: CreateOrUpdateUserDTO) {
    const user = await this.userRepository.findOneBy({
      emailAddress: input.EmailAddress,
    });

    if (user) await this.userRepository.softRemove(user);

    const userInfo = await this.hrmv2Service.getUserInfoByEmail(
      input.EmailAddress,
    );

    const userRole = await this.roleService.getRoleByname(
      this.buildRoleByUserInfo(userInfo.userType, userInfo.jobPosition),
    );

    const classUser = new User();
    const newUser = {
      ...classUser,
      userName: input.EmailAddress.replace(/@ncc.asia/g, ''),
      emailAddress: input.EmailAddress,
      name: input.Name,
      surname: input.Surname,
      phoneNumber: userInfo.phone,
      isActive: userInfo.status !== EmployeeStatus.Quit,
      avatar: '',
      isDeleted: false,
      roles: [userRole],
    };

    await this.userRepository.save(newUser);

    return new UserDTO(newUser);
  }

  async updateUserFromHrm(input: CreateOrUpdateUserDTO) {
    let user = await this.userRepository.findOneBy({
      emailAddress: input.EmailAddress,
    });

    if (!user) {
      throw new NotFoundException(`User ${input.EmailAddress} not found`);
    }

    const userInfo = await this.hrmv2Service.getUserInfoByEmail(
      input.EmailAddress,
    );

    user = {
      ...user,
      userName: input.EmailAddress.replace(/@ncc.asia/g, ''),
      emailAddress: input.EmailAddress,
      name: input.Name,
      surname: input.Surname,
      phoneNumber: userInfo.phone,
      isActive: userInfo.status !== EmployeeStatus.Quit,
      isDeleted: false,
    };

    if (process.env.NODE_ENV === 'production') {
      const userRole = await this.roleService.getRoleByname(
        this.buildRoleByUserInfo(userInfo.userType, userInfo.jobPosition),
      );
      user.roles = [userRole];
    }

    await this.userRepository.save(user);
  }

  async updateUserStatus(emailAddress: string, status: boolean) {
    const user = await this.userRepository.findOneBy({
      emailAddress,
    });

    if (!user) {
      throw new NotFoundException(`User ${emailAddress} not found`);
    }

    user.isActive = status;

    await this.userRepository.save(user);
  }

  async createUsersFromHrm(body: CreateOrUpdateUserDTO[]) {
    const users = await Promise.allSettled(
      body.map(async (user) => {
        try {
          return await this.createUserFromHrm(user);
        } catch (err) {
          return Promise.reject(err.message);
        }
      }),
    );
    const createdUsers = users
      .filter(
        (result): result is PromiseFulfilledResult<UserDTO> =>
          result.status === 'fulfilled',
      )
      .map((result) => result.value.emailAddress);

    const errorUsers = users
      .filter(
        (result): result is PromiseRejectedResult =>
          result.status === 'rejected',
      )
      .map((result) => result.reason);

    this.logger.info(
      `HRMv2 sync: ${createdUsers.length} user created successfully`,
      createdUsers,
    );
    this.logger.info(
      `HRMv2 sync: ${errorUsers.length} user created fail`,
      errorUsers,
    );
  }
}
