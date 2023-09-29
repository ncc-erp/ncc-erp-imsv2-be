import {
  PermitActions,
  RequireMission,
} from '@/common/decorators/authorization.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/entities/user.entity';
import { Action } from '@/types/authorization/action.enum';
import { Mission } from '@/types/authorization/mission.enum';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateUserRoleDTO } from './dto/update-user-role.dto';
import { UserFilter } from './dto/user-filter.dto';
import { UserProfileDTO } from './dto/user-profile.dto';
import { UserService } from './user.service';
import { imageTypeFilter } from '@common/filter/image-type.filter';
import { FileInterceptor } from '@nestjs/platform-express';

@RequireMission(Mission.USER)
@ApiBearerAuth()
@Controller('user')
@ApiTags('Users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /*
   * Update user's roles
   */
  @Put('roles')
  @PermitActions(Action.MANAGE)
  async updateRoles(@Body() updateRoleDTO: UpdateUserRoleDTO) {
    return this.userService.updateRoles(
      { id: updateRoleDTO.userId },
      updateRoleDTO.roleNames,
    );
  }

  /*
   * Get user by Id
   */
  @Get('details/:id')
  @PermitActions(Action.READ)
  async getUser(@Param('id') id: number) {
    const user = await this.userService.findOneWhere({
      id: id ?? -1,
    });
    if (!user) throw new BadRequestException('User not found');
    return new UserProfileDTO(user);
  }

  /*
   * Get my profile
   */
  @PermitActions(Action.READ)
  @Get('profile')
  async getProfile(@CurrentUser() user: User) {
    return new UserProfileDTO(user);
  }

  /*
   * Get all users
   */
  @PermitActions(Action.READ)
  @Get()
  async getAllUsers(@Query() userFilter: UserFilter) {
    return this.userService.getAllUsers(userFilter);
  }

  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: {
        fileSize: 5000000,
      },
      fileFilter: imageTypeFilter,
    }),
  )
  @ApiConsumes('multipart/form-data')
  @PermitActions(Action.READ)
  @ApiOperation({
    summary: 'User upload avatar',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadAvatar(
    @UploadedFile()
    avatar: Express.Multer.File,
  ) {
    if (!avatar) throw new BadRequestException('Image must be not null');
    await this.userService.uploadAvatar(avatar);
  }
}
