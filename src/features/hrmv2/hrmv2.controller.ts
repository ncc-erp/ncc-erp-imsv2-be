import {
  PermitActions,
  RequireMission,
} from '@/common/decorators/authorization.decorator';
import { Mission } from '@/types/authorization/mission.enum';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Action } from '@type/authorization/action.enum';
import { AllPunishmentFundsDTO } from './dto/all-punishment-funds.dto';
import { GridParam, GridResult } from './dto/grid-param.dto';
import { TeamDTO } from './dto/team.dto';
import { UserInfoDTO } from './dto/user-info.dto';
import { Hrmv2Service } from './hrmv2.service';

@RequireMission(Mission.HRMV2)
@ApiTags('HRM V2')
@Controller('hrmv2')
@ApiBearerAuth()
export class Hrmv2Controller {
  constructor(private readonly hrmv2Service: Hrmv2Service) {}

  @PermitActions(Action.READ)
  @Get('teams')
  @ApiResponse({ type: [TeamDTO] })
  async getTeams() {
    return await this.hrmv2Service.getAllTeams();
  }

  @PermitActions(Action.READ)
  @Get('user-info')
  @ApiResponse({ type: UserInfoDTO })
  async getUserInfoByEmail(@Query('email') email: string) {
    return await this.hrmv2Service.getUserInfoByEmail(email);
  }

  @PermitActions(Action.READ)
  @Get('fund-current-balance')
  @ApiResponse({ type: Number })
  async getFundCurrentBalance() {
    return await this.hrmv2Service.getFundCurrentBalance();
  }

  @PermitActions(Action.READ)
  @Get('fund-amount-histories')
  @ApiResponse({ type: GridResult<AllPunishmentFundsDTO> })
  async getFundAmountHistories(@Query() input: GridParam) {
    return await this.hrmv2Service.getFundAmountHistories(input);
  }
}
