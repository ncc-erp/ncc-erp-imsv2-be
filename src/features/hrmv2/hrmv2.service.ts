import { ClientService } from '@/client/client.service';
import { AbpApiResponse } from '@/common/dto/abp-api-response.dto';
import { LoggerService } from '@/logger/logger.service';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  AllPunishmentFundsDTO,
  InputToGetAllPagingDTO,
} from './dto/all-punishment-funds.dto';
import { GridParam, GridResult } from './dto/grid-param.dto';
import { ITeam, TeamDTO } from './dto/team.dto';
import { UserInfoDTO } from './dto/user-info.dto';
import { HostName } from '@/client/type/client-env.type';
import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class Hrmv2Service {
  constructor(
    @Inject(HostName.HRMV2)
    private readonly clientService: ClientService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(Hrmv2Service.name);
  }

  async getAllTeams() {
    const response = await this.clientService.get<AbpApiResponse<ITeam[]>>(
      '/api/services/app/Public/GetAllTeam',
    );
    return response.result.map((team) => new TeamDTO(team));
  }

  async getUserInfoByEmail(email: string) {
    const response = await this.clientService
      .get<AbpApiResponse<UserInfoDTO>>(
        `/api/services/app/Timesheet/GetUserInfoByEmail?email=${email}`,
      )
      .catch(() =>
        this.logger.error(new NotFoundException(`User ${email} not found`)),
      );
    return response ? response.result : null;
  }

  async getAllTeamIds() {
    const teams = await this.getAllTeams();
    return teams.map((team) => team.id);
  }

  async getFundCurrentBalance() {
    const response = await this.clientService.get<AbpApiResponse<number>>(
      '/api/services/app/Public/GetFundCurrentBalance',
    );
    return response.result;
  }

  async getFundAmountHistories(input: GridParam) {
    if (input.amount && !input.comparisonOperator)
      throw new BadRequestException(
        'Filter amount must have comparisonOperator',
      );
    if (input.comparisonOperator && !input.amount)
      throw new BadRequestException('Filter amount must be a number');

    const payload = {
      ...input,
      ...(input.amount &&
        input.comparisonOperator && {
          filterItems: [
            {
              propertyName: 'amount',
              value: input.amount,
              comparision: input.comparisonOperator,
            },
          ],
        }),
    };

    const response = await this.clientService.post<
      InputToGetAllPagingDTO,
      AbpApiResponse<GridResult<AllPunishmentFundsDTO>>
    >('/api/services/app/Public/GetFunAmountHistories', { gridParam: payload });

    return new GridResult<AllPunishmentFundsDTO>(
      response.result?.items.map((item) =>
        plainToInstance(AllPunishmentFundsDTO, item, {
          excludeExtraneousValues: true,
        }),
      ),
      response.result?.totalCount,
    );
  }
}
