import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  Unique,
} from 'typeorm';
import { AuditEntity } from '@entities/base/audit.entity';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import {
  USER_UNIQUE_CONSTRAINT_1,
  USER_UNIQUE_CONSTRAINT_2,
  USER_UNIQUE_CONSTRAINT_3,
  USER_UNIQUE_CONSTRAINTS,
} from '@common/constants/imsv1.constant';
import { Role } from './role.entity';
import { UserWidget } from './user-widget.entity';
import { Exclude, Transform } from 'class-transformer';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { UserLike } from './userlike.entity';
import { formatImageUrl } from '@utils/url';

@Entity()
@Unique(USER_UNIQUE_CONSTRAINTS)
export class User extends AuditEntity {
  @Column({ name: USER_UNIQUE_CONSTRAINT_1 })
  @IsString()
  userName: string;

  @Column({ name: USER_UNIQUE_CONSTRAINT_2 })
  @IsString()
  emailAddress: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  name: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  surname: string;

  @Column({
    nullable: true,
    select: false,
  })
  @IsOptional()
  @IsString()
  password: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiHideProperty()
  @Exclude()
  @Column()
  @IsBoolean()
  isActive: boolean;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => formatImageUrl(value), { toPlainOnly: true })
  avatar?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  komuUserName?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  userCode?: string;

  @ApiHideProperty()
  @Exclude()
  @Column({ nullable: true })
  @IsString()
  komuUserId?: string;

  @ApiHideProperty()
  @Exclude()
  @Column({ nullable: true, name: USER_UNIQUE_CONSTRAINT_3 })
  @IsOptional()
  @IsNumber()
  imsv1EntityId?: number;

  @ApiHideProperty()
  @Exclude()
  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  imsv1EntityName?: string;

  @ApiProperty({
    default: [
      {
        id: 1,
        name: 'Admin',
      },
    ],
  })
  @ManyToMany(() => Role, (role) => role.users, { eager: true })
  @JoinTable()
  roles?: Role[];

  @ApiHideProperty()
  @OneToMany(() => UserWidget, (uw) => uw.user)
  @JoinTable()
  userWidgets?: UserWidget[];

  @ApiHideProperty()
  @OneToMany(() => UserLike, (ul) => ul.user)
  userLike?: UserLike[];
}
