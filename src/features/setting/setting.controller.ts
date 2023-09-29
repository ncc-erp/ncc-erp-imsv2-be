import {
  PermitActions,
  RequireMission,
} from '@/common/decorators/authorization.decorator';
import { Mission } from '@/types/authorization/mission.enum';
import {
  Body,
  Controller,
  Get,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Action } from '@type/authorization/action.enum';
import { SettingEmailDTO, SettingKomuDTO } from './dto/setting.dto';
import { SettingService } from './setting.service';

@RequireMission(Mission.SETTING)
@ApiTags('Setting')
@Controller('setting')
@ApiBearerAuth()
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  /*
   * Get settings
   */
  @PermitActions(Action.MANAGE)
  @Get()
  async getSettings() {
    return this.settingService.getSettings();
  }

  /*
   * Update email settings
   */
  @PermitActions(Action.MANAGE)
  @ApiBody({ type: SettingEmailDTO })
  @Put('email-setting')
  @UsePipes(new ValidationPipe())
  async updateEmailSetting(@Body() updateEmailSettings: SettingEmailDTO) {
    return this.settingService.updateSetting(updateEmailSettings);
  }

  /*
   * Update komu settings
   */
  @PermitActions(Action.MANAGE)
  @ApiBody({ type: SettingKomuDTO })
  @Put('komu-setting')
  @UsePipes(new ValidationPipe())
  async updateKomuSetting(@Body() updateKomuSettings: SettingKomuDTO) {
    return this.settingService.updateSetting(updateKomuSettings);
  }
}
