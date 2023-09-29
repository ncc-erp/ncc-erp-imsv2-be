import { UserLike } from '@entities/userlike.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { SaveLikeDTO } from './dto/save-like.dto';
import { In } from 'typeorm/find-options/operator/In';
import { LikeableEntity } from '@type/entityName.enum';

@Injectable()
export class LikesService {
  constructor(
    private readonly userService: UserService,
    @InjectRepository(UserLike)
    private readonly uLikeRepository: Repository<UserLike>,
  ) {}

  insertMany(data: UserLike[]) {
    return this.uLikeRepository.save(data);
  }

  deleteMany(filter: FindOptionsWhere<UserLike>) {
    return this.uLikeRepository.delete(filter);
  }

  getAllUserLikes(id: number) {
    return this.uLikeRepository.find({
      where: {
        userId: id,
      },
    });
  }

  async userLiked(
    { entityId, entityName }: SaveLikeDTO,
    userId = this.userService.getCurrentUser().id,
  ) {
    const userLike = await this.uLikeRepository.findOne({
      where: {
        userId,
        entityId,
        entityName,
      },
    });

    return userLike;
  }

  async saveLike(
    userLikeDTO: SaveLikeDTO,
    userId = this.userService.getCurrentUser().id,
  ) {
    const existUserLiked = await this.userLiked(userLikeDTO, userId);
    return await this.uLikeRepository.save({
      id: existUserLiked?.id ?? undefined,
      userId,
      ...userLikeDTO,
    });
  }

  async getLikesCount(userLikeDTO: SaveLikeDTO) {
    return this.uLikeRepository.countBy({
      entityId: userLikeDTO.entityId,
      entityName: userLikeDTO.entityName,
    });
  }

  async getCurrentUserLiked(
    newsId: number[],
    userId: number,
    entityName: LikeableEntity,
  ) {
    const userLikes = await this.uLikeRepository.find({
      select: {
        entityId: true,
      },
      where: {
        userId: userId,
        entityId: In(newsId),
        liked: true,
        entityName: entityName,
      },
    });
    return userLikes.map((userLike) => userLike.entityId);
  }
}
