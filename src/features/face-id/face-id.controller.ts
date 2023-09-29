import {
  PermitActions,
  RequireMission,
} from '@/common/decorators/authorization.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { LoggerService } from '@/logger/logger.service';
import { Action } from '@/types/authorization/action.enum';
import { Mission } from '@/types/authorization/mission.enum';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CheckIn,
  ImagesInfoUserDTO,
  ReturnCheckInDTO,
} from './dto/face-id.dto';
import { FaceIdService } from './face-id.service';

@RequireMission(Mission.FACEID)
@ApiTags('FaceId')
@Controller('face-id')
@ApiBearerAuth()
export class FaceIdController {
  constructor(
    private readonly faceIdService: FaceIdService,
    private readonly logger: LoggerService,
  ) {}

  @PermitActions(Action.READ)
  @Get('getListImage')
  @ApiResponse({ type: [ImagesInfoUserDTO] })
  async getListImage() {
    return await this.faceIdService.getAllFacesAsync();
  }

  /*
   *  CheckIn with base64 img
   */
  @PermitActions(Action.READ)
  @Post('check-in')
  @ApiBody({ type: CheckIn })
  @ApiResponse({ type: ReturnCheckInDTO })
  async checkInFace(@Body() input: CheckIn, @CurrentUser('id') userId: number) {
    try {
      return await this.faceIdService.checkInFaceId(userId, input.img);
    } catch (e) {
      this.logger.error(e.response?.data?.error);
      throw e;
    }
  }
}
