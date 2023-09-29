import {
  PermitActions,
  RequireMission,
} from '@/common/decorators/authorization.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/entities/user.entity';
import { LoggerService } from '@/logger/logger.service';
import { Action } from '@/types/authorization/action.enum';
import { Mission } from '@/types/authorization/mission.enum';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { GetCommentQueryDto } from './dto/get-comment-query.dto';

@ApiTags('Comment')
@RequireMission(Mission.COMMENT)
@Controller('comment')
@ApiBearerAuth()
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly logger: LoggerService,
  ) {}

  @PermitActions(Action.READ)
  @Post()
  async create(@Body() createCommentDto: CreateCommentDto) {
    const result = await this.commentService.create(createCommentDto);
    return {
      status: HttpStatus.CREATED,
      message: `Comment ${result.id} has created successfully!`,
      commentId: result.id,
    };
  }

  @PermitActions(Action.READ)
  @Get()
  findAll(@Query() query?: GetCommentQueryDto) {
    return this.commentService.findAll({
      newsId: query.newsId,
    });
  }

  @PermitActions(Action.READ)
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.commentService.findOne({ where: { id } });
  }

  @PermitActions(Action.READ)
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    await this.commentService.update(id, updateCommentDto);
    return {
      status: HttpStatus.CREATED,
      message: `Comment ${id} has updated successfully!`,
      commentId: id,
    };
  }

  @PermitActions(Action.READ)
  @Delete(':id')
  async remove(@Param('id') id: number) {
    await this.commentService.remove(id);

    return {
      status: HttpStatus.OK,
      message: `Comment ${id} has deleted successfully!`,
      commentId: id,
    };
  }

  /*
   * User like/unlike Comments
   */
  @PermitActions(Action.READ)
  @Post('like/:id')
  async saveLike(
    @Param('id') entityId: number,
    @Query('liked') liked: boolean,
    @CurrentUser() user: User,
  ) {
    try {
      await this.commentService.saveLike(entityId, liked);
      return {
        status: HttpStatus.CREATED,
        message: `User ${user.emailAddress} has ${
          liked ? 'liked' : 'unliked'
        } Comments, id = ${entityId}`,
      };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
