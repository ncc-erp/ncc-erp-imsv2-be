import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RolePermission } from './role-permission.entity';
import { User } from './user.entity';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsString()
  name: string;

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role, {
    cascade: true,
  })
  @ValidateNested({ each: true })
  @Type(() => RolePermission)
  rolePermissions?: RolePermission[];

  @ManyToMany(() => User, (u) => u.roles)
  users?: User[];
}
