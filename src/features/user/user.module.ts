import { User } from '@entities/user.entity';
import { RoleModule } from '@features/role/role.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { IsValidColumnNameConstraint } from '@common/decorators/valid-column-name.decorator';
import { Hrmv2Module } from '../hrmv2/hrmv2.module';
import { FilesModule } from '@features/files/files.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    RoleModule,
    Hrmv2Module,
    FilesModule,
  ],
  providers: [UserService, IsValidColumnNameConstraint],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
