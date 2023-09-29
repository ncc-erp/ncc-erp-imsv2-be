import { PublicSecurity } from '@/common/decorators/authorization.decorator';
import { AbpApiResponse } from '@/common/dto/abp-api-response.dto';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBody, ApiHeader, ApiTags } from '@nestjs/swagger';
import { CreateOrUpdateUserDTO } from './dto/create-or-update-user.dto';
import { CreateQuickNewsDTO } from './dto/create-quick-news.dto';
import { PublicService } from './public.service';

@PublicSecurity()
@ApiTags('PublicService')
@Controller('services/app')
@ApiHeader({
  name: 'X-Secret-Key',
  description: 'SecretKey to access IMS',
})
@ApiHeader({
  name: 'securityCode',
  description: 'SecurityCode to access IMS',
})
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('Public/CheckConnect')
  async checkConnect() {
    return new AbpApiResponse({ isConnected: true, message: 'Connected' });
  }

  @Post('QuickNews/Create')
  @ApiBody({ type: CreateQuickNewsDTO })
  async createQuickNews(@Body() body: CreateQuickNewsDTO) {
    try {
      const res = this.publicService.createQuickNews(
        body.content ?? body.Content,
      );
      return res;
    } catch (ex) {
      throw ex;
    }
  }

  @Post('Hrmv2/CreateUserByHRM')
  @ApiBody({ type: CreateOrUpdateUserDTO })
  async createUserByHRM(@Body() body: CreateOrUpdateUserDTO) {
    try {
      const res = await this.publicService.createUserFromHrm(body);
      return res;
    } catch (ex) {
      throw ex;
    }
  }

  @Post('Hrmv2/CreateUsersByHRM')
  @ApiBody({ type: CreateOrUpdateUserDTO, isArray: true })
  async createUsersByHRM(@Body() body: CreateOrUpdateUserDTO[]) {
    await this.publicService.createUsersFromHrm(body);
  }

  @Post('Hrmv2/UpdateUserByHRM')
  @ApiBody({ type: CreateOrUpdateUserDTO })
  async updateUserByHRM(@Body() body: CreateOrUpdateUserDTO) {
    try {
      const res = await this.publicService.updateUserFromHrm(body);
      return res;
    } catch (ex) {
      throw ex;
    }
  }

  @Post('Hrmv2/ConfirmUserQuit')
  @ApiBody({ type: CreateOrUpdateUserDTO })
  async confirmUserQuit(@Body() body: CreateOrUpdateUserDTO) {
    try {
      await this.publicService.updateUserStatus(body.EmailAddress, false);
    } catch (ex) {
      throw ex;
    }
  }

  @Post('Hrmv2/ConfirmUserPause')
  @ApiBody({ type: CreateOrUpdateUserDTO })
  async confirmUserPause(@Body() body: CreateOrUpdateUserDTO) {
    try {
      await this.publicService.updateUserStatus(body.EmailAddress, false);
    } catch (ex) {
      throw ex;
    }
  }

  @Post('Hrmv2/ConfirmUserMaternityLeave')
  @ApiBody({ type: CreateOrUpdateUserDTO })
  async confirmUserMaternityLeave(@Body() body: CreateOrUpdateUserDTO) {
    try {
      await this.publicService.updateUserStatus(body.EmailAddress, false);
    } catch (ex) {
      throw ex;
    }
  }

  @Post('Hrmv2/ConfirmUserBackToWork')
  @ApiBody({ type: CreateOrUpdateUserDTO })
  async confirmUserBackToWork(@Body() body: CreateOrUpdateUserDTO) {
    try {
      await this.publicService.updateUserStatus(body.EmailAddress, true);
    } catch (ex) {
      throw ex;
    }
  }
}
