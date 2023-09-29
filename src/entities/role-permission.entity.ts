import { IsEnum } from 'class-validator';
import { Action } from '@type/authorization/action.enum';
import { Mission } from '@type/authorization/mission.enum';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from './role.entity';

@Entity()
export class RolePermission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    array: true,
    enum: Action,
    default: [Action.READ],
  })
  @IsEnum(Action, { each: true })
  actions: Action[];

  @Column({
    type: 'enum',
    enum: Mission,
  })
  @IsEnum(Mission)
  mission: Mission;

  @ManyToOne(() => Role, (role) => role.rolePermissions, { nullable: false })
  role: Role;
}
