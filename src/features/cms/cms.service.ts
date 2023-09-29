import { OrderingDirection } from '@/common/constants/order.constant';
import { KOMU_SERVICE_TOKEN } from '@/common/constants/token.constant';
import { PageOptionsDTO } from '@/common/dto/page-options.dto';
import { PageableDTO } from '@/common/dto/pageable.dto';
import { Comment } from '@/entities/comment.entity';
import { NewsRelation } from '@/entities/news-relation.entity';
import { User } from '@/entities/user.entity';
import { UserLike } from '@/entities/userlike.entity';
import { LoggerService } from '@/logger/logger.service';
import { toNewsDTO } from '@/mapping/news.mapping';
import {
  EntityName,
  LikeableEntity,
  NewsCategories,
} from '@/types/entityName.enum';
import { StatusType } from '@/types/status.enum';
import { EntityType } from '@entities/entityType.entity';
import { News } from '@entities/news.entity';
import { QuickNews } from '@entities/quicknews.entity';
import { EntityTypeDTO } from '@features/entity-type/dto/entity-type.dto';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { BaseService } from '../base/base.service';
import { CommentService } from '../comment/comment.service';
import { EntityTypeService } from '../entity-type/entity-type.service';
import { FilesService } from '../files/files.service';
import { Hrmv2Service } from '../hrmv2/hrmv2.service';
import { KomuService } from '../komu/komu.service';
import { LikesService } from '../likes/likes.service';
import { UserService } from '../user/user.service';
import { NewsFilter } from './dto/news-filter.dto';
import { NewsDTO } from './dto/news.dto';
import { QuickNewsDTO } from './dto/quick-news.dto';
import { SaveNewsDTO } from './dto/save-news.dto';
import { SearchFilter } from './dto/search-filter.dto';
import { statusChangeIsValid } from './utils/statusCheck';

@Injectable()
export class CMSService extends BaseService<News> {
  constructor(
    private readonly fileService: FilesService,
    private readonly hrmService: Hrmv2Service,
    private readonly logger: LoggerService,
    private readonly enTyService: EntityTypeService,
    private readonly likesService: LikesService,
    private readonly cmtService: CommentService,
    private readonly userService: UserService,
    @InjectRepository(News)
    private readonly newsRepository: Repository<News>,
    @InjectRepository(QuickNews)
    private readonly quickNewsRepository: Repository<QuickNews>,
    @InjectRepository(NewsRelation)
    private readonly relationNewsRepository: Repository<NewsRelation>,
    @Inject(KOMU_SERVICE_TOKEN)
    private readonly komuService: KomuService,
  ) {
    super(newsRepository, News);
    this.logger.setContext(CMSService.name);
  }

  insertNews(data: News[]) {
    return this.newsRepository.save(data);
  }

  insertQNews(data: QuickNews[]) {
    return this.quickNewsRepository.save(data);
  }

  insertSingleQNews(data: QuickNews) {
    return this.quickNewsRepository.save(data);
  }

  async deleteNews(filter: FindOptionsWhere<News>) {
    const news = await this.getNews({ where: filter });
    if (!news) throw new NotFoundException('News not found');
    return this.newsRepository.remove(news);
  }

  async deleteNewsBy(filter: FindOptionsWhere<News>) {
    return await this.newsRepository.delete(filter);
  }

  async softDeleteNews(filter: FindOptionsWhere<News>) {
    const news = await this.getNews({ where: filter });
    if (!news) throw new NotFoundException('News not found');
    return this.newsRepository.softRemove(news);
  }

  deleteQNews(filter: FindOptionsWhere<QuickNews>) {
    return this.quickNewsRepository.delete(filter);
  }

  async getSearchFilter() {
    const categories: EntityTypeDTO[] = await this.enTyService.getCategories(
      NewsCategories.map((n) => <EntityName>n.id),
    );

    const filter = new SearchFilter();
    filter.mainCategories = [...NewsCategories];
    filter.subCategories = categories;

    return filter;
  }

  async getAllNews(pageOptionsDTO: NewsFilter, isAdmin = false) {
    const {
      orderBy,
      search,
      order,
      skip,
      size,
      mainCategory,
      subCategoryId,
      status,
      from,
      to,
    } = pageOptionsDTO;

    const queryBuilder = this.newsRepository
      .createQueryBuilder('news')
      .leftJoin(EntityType, 'et', 'news.entityTypeId = et.id')
      .addSelect('et.entityName', 'news_mainCategory')
      .addSelect('et.displayName', 'news_subCategory')
      .addSelect('et.color', 'news_subCategoryColor')
      .leftJoin(User, 'u', 'news.createdBy = u.id')
      .addSelect('u.name', 'user_name')
      .addSelect('u.surname', 'user_surname')
      .where('news.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('et.isActive = true');

    if (!isAdmin) {
      const userTeamIds = await this.userService.getUserTeamIds(
        this.userService.getCurrentUser().emailAddress,
      );
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('news.teamIds && ARRAY[:...userTeamIds]::integer[]', {
            userTeamIds,
          }).orWhere("news.teamIds = '{}'");
        }),
      );
    }

    if (search) {
      queryBuilder.andWhere(
        '(LOWER(news.title) LIKE :search OR LOWER(news.sapo) LIKE :search OR LOWER(news.description) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }
    if (mainCategory) {
      queryBuilder.andWhere('et.entityName = :mainCategory', {
        mainCategory: mainCategory,
      });
    }
    if (subCategoryId) {
      queryBuilder.andWhere('news.entityTypeId = :subCategoryId', {
        subCategoryId: subCategoryId,
      });
    }
    if (status) {
      queryBuilder.andWhere('news.status = :status', {
        status: status,
      });
    }
    if (from && !to) {
      queryBuilder.andWhere('news.publishedTime >= :from', {
        from: from,
      });
    }
    if (to && !from) {
      queryBuilder.andWhere('news.publishedTime <= :to', {
        to: to,
      });
    }
    if (from && to) {
      queryBuilder.andWhere('news.publishedTime between :from and :to', {
        from: from,
        to: to,
      });
    }

    const orderField = orderBy || 'publishedTime';
    queryBuilder.orderBy(`news.${orderField}`, order).offset(skip).limit(size);

    const itemCount = await queryBuilder.getCount();
    const entities = await queryBuilder.getRawMany();
    const newsIds = entities.map((entity) => entity.news_id ?? entity.id);
    const countCommentAndLike = await this.getCountCommentAndLike(newsIds);
    const currentUserHasLikedNewsIds =
      await this.likesService.getCurrentUserLiked(
        newsIds,
        this.userService.getCurrentUser().id,
        LikeableEntity.News,
      );

    const result = [];
    for (const i in entities) {
      result.push({
        ...toNewsDTO(entities[i], currentUserHasLikedNewsIds),
        ...countCommentAndLike[i],
      });
    }

    return new PageableDTO<NewsDTO>(result, {
      itemCount,
      pageOptionsDTO,
    });
  }

  async getLatestNews() {
    const userTeamIds = await this.userService.getUserTeamIds(
      this.userService.getCurrentUser().emailAddress,
    );
    const queryBuilder = this.newsRepository
      .createQueryBuilder('news')
      .leftJoin(EntityType, 'et', 'news.entityTypeId = et.id')
      .addSelect('et.entityName', 'news_mainCategory')
      .addSelect('et.displayName', 'news_subCategory')
      .addSelect('et.color', 'news_subCategoryColor')
      .leftJoin(User, 'u', 'news.createdBy = u.id')
      .addSelect('u.name', 'user_name')
      .addSelect('u.surname', 'user_surname')
      .where('news.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('et.isActive = true')
      .andWhere('news.status = :status', { status: StatusType.Approved })
      .andWhere(
        new Brackets((qb) => {
          qb.where('news.teamIds && ARRAY[:...userTeamIds]::integer[]', {
            userTeamIds,
          }).orWhere("news.teamIds = '{}'");
        }),
      )
      .orderBy(`news.publishedTime`, OrderingDirection.DESC)
      .limit(5);

    const raws = await queryBuilder.getRawMany();
    const newsIds = raws.map((entity) => entity.news_id ?? entity.id);
    const countCommentAndLike = await this.getCountCommentAndLike(newsIds);

    const currentUserHasLikedNewsIds =
      await this.likesService.getCurrentUserLiked(
        newsIds,
        this.userService.getCurrentUser().id,
        LikeableEntity.News,
      );
    const result = [];
    for (const i in raws) {
      result.push({
        ...toNewsDTO(raws[i], currentUserHasLikedNewsIds),
        ...countCommentAndLike[i],
      });
    }

    return result;
  }

  /*
   * Save news
   */
  async saveNews(newsDTO: SaveNewsDTO) {
    // Check and get news ins
    const newsIns = await this.getNewsIns(newsDTO);

    // Get entityType
    newsIns.entityType = await this.getEntityType(newsDTO);
    newsIns.entityTypeId = newsIns.entityType.id;

    // Validate team id
    await this.checkTeamId(newsDTO.teamIds);

    // Save and get relational news
    newsIns.firstRelationNews = await this.getRelationNews(
      newsDTO.relationNewsIds,
      newsIns,
    );

    // Check images
    if (!newsDTO.thumbnailImage && !newsDTO.thumbnailImageFile)
      throw new BadRequestException(
        'Must either include image file or image url',
      );

    const fileProArr: Promise<string | void>[] = [];
    if (newsDTO.coverImageFile)
      fileProArr.push(
        this.fileService
          .getImagesKeys(newsDTO.coverImageFile, newsIns.coverImage)
          .then((key) => (newsDTO.coverImage = key)),
      );
    if (newsDTO.thumbnailImageFile)
      fileProArr.push(
        this.fileService
          .getImagesKeys(newsDTO.thumbnailImageFile, newsIns.thumbnailImage)
          .then((key) => (newsDTO.thumbnailImage = key)),
      );
    await Promise.all(fileProArr);

    const saved = await this.newsRepository.save({
      ...newsIns,
      ...newsDTO,
    } as News);
    return saved.id;
  }

  // * Save news util - Check news save permission and return news instance
  async getNewsIns(newsDTO: SaveNewsDTO) {
    let newsIns = await this.getNews({ where: { id: newsDTO.id ?? 0 } });

    //? Check news existence
    if (!newsIns) {
      if (newsDTO.id)
        throw new NotFoundException(`News not exist, id = ${newsDTO.id}`);
      newsIns = this.newsRepository.create(newsDTO);
    }
    //? Check if is draft
    else if (newsIns.status !== StatusType.Draft) {
      throw new BadRequestException('Only draft can be updated!');
    }

    return newsIns;
  }

  // * Save news util - Check entity type whether it's valid and return entity type
  async getEntityType(newsDTO: SaveNewsDTO) {
    if (!NewsCategories.find((cat) => cat.id === newsDTO.mainCategory))
      throw new BadRequestException('Main category not exist');
    if (
      newsDTO.mainCategory === EntityName.Events &&
      !(newsDTO.effectiveStartTime && newsDTO.effectiveEndTime)
    )
      throw new BadRequestException(
        'Include effective start and end time for this type of News',
      );

    const entityType = await this.enTyService.findOne({
      where: {
        entityName: newsDTO.mainCategory as EntityName,
        displayName: newsDTO.subCategory,
      },
    });
    if (!entityType) throw new BadRequestException('Category not exists');
    return entityType;
  }

  // * Save news util - Check team's ids validity
  async checkTeamId(newsTeamIds: number[]) {
    const teamIds = await this.hrmService.getAllTeamIds();
    newsTeamIds.forEach((id) => {
      if (teamIds.includes(id)) return;
      throw new BadRequestException(`Team's id not exist, id = ${id}`);
    });
  }

  // * Save news util - Check relation news' ids validity, delete old and store new relations
  async getRelationNews(relationNewsIds: number[], newsIns: News) {
    // Check if all relation news's id is valid
    const firstRelationNews = await Promise.all(
      relationNewsIds.map((id) =>
        this.getNews({ where: { id } }).then((relationNews) => {
          if (!relationNews)
            throw new BadRequestException(`News not exist, id = ${id}`);
          const newsRelation = new NewsRelation();
          newsRelation.firstNews = newsIns;
          newsRelation.secondNews = relationNews;
          return newsRelation;
        }),
      ),
    );

    //Save new relations and delete old relations
    await Promise.all([
      this.relationNewsRepository.save(firstRelationNews),
      this.relationNewsRepository.remove([
        ...(newsIns.firstRelationNews ?? []),
        ...(newsIns.secondRelationNews ?? []),
      ]),
    ]);
    return firstRelationNews;
  }

  async changeNewsStatus(
    status: StatusType,
    id: number,
    sendNoticationToChannel = true,
  ) {
    const news = await this.getNews({ where: { id } });
    if (!news) throw new BadRequestException('News not exist');

    if (!statusChangeIsValid(news.status, status))
      throw new BadRequestException(
        `Cannot change status from ${StatusType[news.status]} to ${
          StatusType[status]
        }`,
      );

    // const userId = this.userService.getCurrentUser().id;
    // if (status === StatusType.Waiting && userId !== news.createdBy)
    //   throw new ForbiddenException(
    //     'You dont have permission to submit this news',
    //   );

    news.status = status;
    const newNews = await this.newsRepository.save(news);

    if (status === StatusType.Approved && sendNoticationToChannel) {
      await this.komuService.sendMessageNotifyNews(news);
    }
    return newNews;
  }

  async getNews(options: FindOneOptions<News>) {
    options.where = await this.userService.getFindWhereWithUserTeamPermission({
      ...options.where,
      entityType: {
        isActive: true,
      },
    } as FindOptionsWhere<News>);
    options.relations = options.relations ?? {
      entityType: true,
      firstRelationNews: true,
      secondRelationNews: true,
    };
    return this.newsRepository.findOne(options);
  }

  async getNewsDetails(newsId: number, isAdmin = false) {
    const news = await this.getNews({
      where: {
        id: newsId,
      },
      relations: {
        entityType: true,
        firstRelationNews: {
          secondNews: true,
        },
        secondRelationNews: {
          firstNews: true,
        },
      },
      withDeleted: isAdmin,
    });

    if (!news) throw new BadRequestException('News not exist');

    // If news is not Approved yet and user is not an Admin nor Author
    if (news.status !== StatusType.Approved && !isAdmin)
      throw new ForbiddenException('You are not allowed to view this resource');

    let relationNews = [
      ...(news.firstRelationNews
        ? news.firstRelationNews.map((rel) => rel.secondNews)
        : []),
      ...(news.secondRelationNews
        ? news.secondRelationNews.map((rel) => rel.firstNews)
        : []),
    ];

    if (!isAdmin)
      relationNews = relationNews.filter(
        (rel) => rel.status == StatusType.Approved,
      );

    const [countCmtLike, userLiked, comments, author] = await Promise.all([
      this.getCountCommentAndLike([news.id]).then((res) => res?.[0]),
      this.likesService.userLiked({
        entityId: newsId,
        entityName: LikeableEntity.News,
      }),
      this.cmtService.findAll({ newsId }),
      this.userService.findOneWhere({ id: news.createdBy }),
    ]);

    return {
      ...toNewsDTO({
        ...news,
        relationNews,
        user_name: author.name,
        user_surname: author.surname,
      }),
      ...countCmtLike,
      hasCurrentUserLiked: userLiked?.liked ?? false,
      comments,
    };
  }

  async getCountCommentAndLike(newsIds: number[]) {
    const countQueryBuilder = this.newsRepository
      .createQueryBuilder('news')
      .leftJoin(Comment, 'cmt', 'news.id = cmt.newsId')
      .leftJoin(
        UserLike,
        'ul',
        `news.id = ul.entityId AND ul.entityName = :entityName AND ul.liked = true`,
        {
          entityName: LikeableEntity.News,
        },
      )
      .where('news.isDeleted = :isDeleted', { isDeleted: false });

    if (newsIds.length)
      countQueryBuilder.andWhere('news.id IN (:...newsIds)', {
        newsIds: newsIds,
      });

    countQueryBuilder
      .groupBy('news.id')
      .select('news.id', 'id')
      .addSelect('COUNT(DISTINCT cmt.id)', 'countComment')
      .addSelect('COUNT(DISTINCT ul.id)', 'countLike');

    const counts = await countQueryBuilder.getRawMany();

    return newsIds.map((newsId) => ({
      countComment: +counts.find((c) => c.id === newsId)?.countComment || 0,
      countLike: +counts.find((c) => c.id === newsId)?.countLike || 0,
    }));
  }

  async saveLike(id: number, liked: boolean) {
    const news = await this.getNews({ where: { id } });
    if (!news) throw new BadRequestException('News not exist');
    if (!news.allowLike)
      throw new ForbiddenException('News does not allow like');
    return this.likesService.saveLike({
      entityId: id,
      entityName: LikeableEntity.News,
      liked,
    });
  }

  async getQuickNews(options: PageOptionsDTO) {
    const [quickNews, itemCount] = await Promise.all([
      this.quickNewsRepository.find({
        where: { isDeleted: false },
        skip: options.skip,
        order: {
          createdTime: OrderingDirection.DESC,
        },
        take: options.size,
      }),
      this.quickNewsRepository.count({}),
    ]);

    const result = quickNews.map((qn) => new QuickNewsDTO(qn));

    return new PageableDTO<QuickNewsDTO>(result, {
      itemCount,
      pageOptionsDTO: options,
    });
  }
}
