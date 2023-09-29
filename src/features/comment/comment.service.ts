import { Comment } from '@/entities/comment.entity';
import { News } from '@/entities/news.entity';
import { User } from '@/entities/user.entity';
import { UserLike } from '@/entities/userlike.entity';
import { toReturnCommentDto } from '@/mapping/comment.mapping';
import { RoleName } from '@/types/authorization/role.enum';
import { LikeableEntity } from '@/types/entityName.enum';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';
import { LikesService } from '../likes/likes.service';
import { UserService } from '../user/user.service';
import { CommentDto } from './dto/comment.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(News)
    private readonly newsRepository: Repository<News>,
    private readonly likesService: LikesService,
    private readonly userService: UserService,
  ) {}

  insertMany(data: Comment[]) {
    return this.commentRepository.save(data);
  }

  deleteMany(filter: FindOptionsWhere<Comment>) {
    return this.commentRepository.delete(filter);
  }

  async create(createCommentDto: CreateCommentDto) {
    const news = await this.newsRepository.findOne({
      where: await this.userService.getFindWhereWithUserTeamPermission({
        id: createCommentDto.newsId,
      }),
    });

    if (!news) {
      throw new BadRequestException('News not found');
    }

    const comment = new Comment({
      ...createCommentDto,
    });

    if (createCommentDto.parentCommentId) {
      const parentComment = await this.commentRepository.findOne({
        where: {
          id: createCommentDto.parentCommentId,
          newsId: createCommentDto.newsId,
        },
      });

      if (!parentComment) {
        throw new BadRequestException('Parent comment is not in the same news');
      }

      comment.parentComment = parentComment;
    }

    comment.news = news;
    const result = await this.commentRepository.save(comment);
    return result;
  }

  async findAll(filter: FindOptionsWhere<Comment>) {
    const userId = this.userService.getCurrentUser().id;
    const queryBuilder = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoin(
        UserLike,
        'ul',
        `comment.id = ul.entityId and ul.entityName = 'Comments'`,
      )
      .addSelect(
        'SUM(CASE WHEN ul.liked = TRUE THEN 1 ELSE 0 END)',
        'countLike',
      )
      .addSelect(
        `COUNT(CASE WHEN ul.liked = TRUE AND ul.userId = ${userId} THEN 1 else null end)`,
        'liked',
      )
      .leftJoin(User, 'user', 'user.id = comment.createdBy')
      .addSelect('user.userName, user.avatar, user.name')
      .groupBy('comment.id')
      .addGroupBy('user.userName, user.avatar, user.name')
      .orderBy('comment."createdTime"', 'DESC');

    if (filter.newsId) {
      queryBuilder.andWhere('comment.newsId = :newsId', {
        newsId: filter.newsId,
      });
    }

    const result = await queryBuilder.getRawMany();

    return result.map((c) => toReturnCommentDto(c));
  }

  async findOne(filter: FindOneOptions<Comment>) {
    filter.where = {
      ...filter.where,
      news: await this.userService.getFindWhereWithUserTeamPermission({}),
    };

    filter.relations = {
      ...filter.relations,
      user: true,
      news: true,
    };

    const comment = await this.commentRepository.findOne(filter);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const likesCount = await this.getCommentLikeCount(comment.id);
    const commentDto = {
      ...comment,
      likesCount,
    };
    const returnComment = new CommentDto(commentDto);
    return returnComment;
  }

  async update(id: number, updateCommentDto: UpdateCommentDto) {
    const comment = await this.findOne({ where: { id } });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const userId = this.userService.getCurrentUser().id;
    if (userId !== comment.createdBy)
      throw new ForbiddenException(
        'You are not allowed to update this comment',
      );

    this.commentRepository.save({
      ...comment,
      ...updateCommentDto,
    });
  }

  async remove(id: number) {
    const comment = await this.findOne({
      where: {
        id,
      },
      relations: {
        childrenComments: true,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const user = this.userService.getCurrentUser();
    if (
      user.id !== comment.createdBy &&
      !user.roles.find((role) => role.name === RoleName.ADMIN)
    )
      throw new ForbiddenException(
        'You are not allowed to remove this comment',
      );

    await this.commentRepository.softRemove(comment);
  }

  async saveLike(id: number, liked: boolean) {
    await this.findOne({ where: { id } });
    return await this.likesService.saveLike({
      entityId: id,
      entityName: LikeableEntity.Comments,
      liked,
    });
  }

  async getCommentLikeCount(id: number) {
    return this.likesService.getLikesCount({
      entityId: id,
      entityName: LikeableEntity.Comments,
    });
  }
}
