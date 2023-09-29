import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { Cache } from 'cache-manager';
import { IRolePermissions } from '@type/authorization/role-permission.interface';
import { RolePermission } from '@entities/role-permission.entity';
import { Role } from '@entities/role.entity';
import { UpdateRoleDTO } from './dto/update-role.dto';
import { UpdatePermissionsDTO } from './dto/update-permissions.dto';
import { formatRPC2S } from '@/mapping/rolePermissions.mapping';
import { RoleName } from '@/types/authorization/role.enum';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async saveRole(data: Role) {
    return this.roleRepository.save(data);
  }

  async saveManyRole(data: Role[]) {
    return this.roleRepository.save(data);
  }

  async getManyRole(filter: FindManyOptions<Role>) {
    return this.roleRepository.find(filter);
  }

  async getOneRole(filter: FindOneOptions<Role>) {
    return this.roleRepository.findOne(filter);
  }

  async deleteRole(filter: FindOptionsWhere<Role>) {
    return this.roleRepository.delete(filter);
  }

  async updateRole(data: UpdateRoleDTO) {
    return this.roleRepository.update(data.id, data);
  }

  async getRoleByname(name: RoleName) {
    const role = await this.roleRepository.findOne({
      where: { name: name },
    });

    if (!role) {
      const newRole = new Role();
      newRole.name = name;
      await this.roleRepository.save(newRole);
      return newRole;
    }
    return role;
  }

  // Update all role's permissions to cache
  private async updateRoleToCache() {
    const roles = await this.getManyRole({
      relations: {
        rolePermissions: true,
      },
    });

    const rolePermissions: IRolePermissions = {};
    for (const role of roles) rolePermissions[role.name] = role.rolePermissions;

    await this.cacheManager.set('rolePermissions', rolePermissions, 0);

    return rolePermissions;
  }

  //Get all role's permissions
  private async getAllRolePermissions(): Promise<IRolePermissions> {
    const rolePermissions: IRolePermissions = await this.cacheManager.get(
      'rolePermissions',
    );
    if (!rolePermissions) return this.updateRoleToCache();
    return rolePermissions;
  }

  // Get a role's permissions
  async getRolePermissions(roleName: string) {
    return (await this.getAllRolePermissions())[roleName];
  }

  // Update a role's permissions
  async updateRolePermission(data: UpdatePermissionsDTO) {
    const role = await this.getOneRole({
      where: {
        name: data.name,
      },
      relations: {
        rolePermissions: true,
      },
    });
    if (!role) throw new BadRequestException('Role not exist');

    const rolePermissions = formatRPC2S(data.rolePermissions);

    rolePermissions.forEach((rp) => {
      const existPermission = role.rolePermissions.find(
        (r) => r.mission === rp.mission,
      );
      if (!existPermission) {
        const newRolePermission = new RolePermission();
        newRolePermission.mission = rp.mission;
        newRolePermission.actions = rp.actions;
        role.rolePermissions.push(newRolePermission);
      } else existPermission.actions = rp.actions;
    });

    const deleteRolePermission = role.rolePermissions.filter(
      (rp) => !rolePermissions.find((r) => r.mission === rp.mission),
    );

    await Promise.all([
      this.saveRole(role),
      this.rolePermissionRepository.remove(deleteRolePermission),
    ]);
    await this.updateRoleToCache();
  }
}
