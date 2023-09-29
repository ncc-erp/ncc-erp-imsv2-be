import { ITraditionAlbums } from '@/types/imsv1/TraditionAlbums.interface';
import { MSSQL_NAME } from '@common/constants/datasource-name.constant';
import {
  ALBUMSv1_NAME,
  ENTITY_TYPEv1_NAME,
  EVENTSv1_NAME,
  GUIDELINESv1_NAME,
  MAIN_CMTv1_NAME,
  NEWSv1_NAME,
  POLICIESv1_NAME,
  QNEWSv1_NAME,
  SETTINGv1_NAME,
  SUB_CMTv1_NAME,
  UL_DL_EVENTSv1_NAME,
  UL_DL_GLv1_NAME,
  UL_DL_NEWSv1_NAME,
  UL_DL_POLv1_NAME,
  UL_MAIN_CMTv1_NAME,
  UL_SUB_CMTv1_NAME,
  USERSv1_NAME,
} from '@common/constants/imsv1.constant';
import { TraditionalAlbums } from '@entities/album.entity';
import { AuditEntity } from '@entities/base/audit.entity';
import { Comment } from '@entities/comment.entity';
import { EntityType } from '@entities/entityType.entity';
import { News } from '@entities/news.entity';
import { QuickNews } from '@entities/quicknews.entity';
import { Setting } from '@entities/setting.entity';
import { User } from '@entities/user.entity';
import { UserLike } from '@entities/userlike.entity';
import { AlbumsService } from '@features/albums/albums.service';
import { CMSService } from '@features/cms/cms.service';
import { CommentService } from '@features/comment/comment.service';
import { LikesService } from '@features/likes/likes.service';
import { UserService } from '@features/user/user.service';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityName, LikeableEntity } from '@type/entityName.enum';
import { IAbpSettings } from '@type/imsv1/AbpSettings.interface';
import { IAbpUsers } from '@type/imsv1/AbpUsers.interface';
import { IAudit } from '@type/imsv1/base/audit.interface';
import { IComments } from '@type/imsv1/Comments.interface';
import { IEntityType } from '@type/imsv1/EntityType.interface';
import { EntityV1Map } from '@type/imsv1/EntityV1Map.enum';
import { INews } from '@type/imsv1/News.interface';
import { IQuickNews } from '@type/imsv1/QuickNews.interface';
import { IUserLikes } from '@type/imsv1/UserLikes.interface';
import { generateNewId, IdMap, Ids, mapId } from '@utils/mapId';
import {
  EntityManager,
  FindOptionsWhere,
  IsNull,
  Not,
  Repository,
} from 'typeorm';
import { rewriteS3Prefix } from './helper/rewrite-s3-prefix';
import { convertLocalDateTimeToUTC } from '@/utils/date';

interface IQueryOptions {
  limit?: number;
  takeDeleted?: boolean;
  whereFilter?: string;
}

@Injectable()
export class Imsv1Service {
  private userIds: IdMap;
  private newsIds: {
    [key: string]: IdMap;
  };
  private cmtIds: {
    [key: string]: IdMap;
  };
  private entityIds: {
    [key in EntityName]?: number[];
  };
  private imsFilter: FindOptionsWhere<{ imsv1EntityId: number }>;

  constructor(
    @InjectEntityManager(MSSQL_NAME)
    private readonly entityManager: EntityManager,
    private readonly userService: UserService,
    private readonly cmsService: CMSService,
    private readonly cmtService: CommentService,
    private readonly likesService: LikesService,
    private readonly albumsService: AlbumsService,
    @InjectRepository(Setting)
    private readonly settingRepo: Repository<Setting>,
    @InjectRepository(EntityType)
    private readonly enTyRepo: Repository<EntityType>,
  ) {
    this.userIds = {};
    this.newsIds = {
      [NEWSv1_NAME]: {},
      [EVENTSv1_NAME]: {},
      [POLICIESv1_NAME]: {},
      [GUIDELINESv1_NAME]: {},
    };
    this.cmtIds = {
      [MAIN_CMTv1_NAME]: {},
      [SUB_CMTv1_NAME]: {},
    };
    this.entityIds = {};
    this.imsFilter = {
      imsv1EntityId: Not(IsNull()),
    };
  }

  private async get<T>(
    tableName: string,
    { limit = 0, takeDeleted = true, whereFilter = '' }: IQueryOptions = {},
  ): Promise<T> {
    const res: T = await this.entityManager.query(
      `SELECT ${limit ? 'TOP ' + limit : ''} * FROM ${tableName} WHERE 1=1 ${
        takeDeleted ? '' : 'AND IsDeleted = 0'
      } ${whereFilter ? ' AND ' + whereFilter : ''} ORDER BY Id DESC;`,
    );
    return res;
  }

  findAll(limit: number, tableName: string) {
    return this.get(tableName, { limit });
  }

  private constructBase(data: IAudit) {
    const base: AuditEntity = new Comment({});
    if (data.CreationTime) base.createdTime = data.CreationTime;
    if (data.LastModificationTime) base.updatedTime = data.LastModificationTime;
    if (data.DeletionTime) base.deletedTime = data.DeletionTime;

    base.isDeleted = data.IsDeleted;

    base.createdBy = null;
    base.updatedBy = null;
    base.deletedBy = null;

    if (Object.keys(this.userIds).length) {
      base.createdBy = this.userIds[+data.CreatorUserId] ?? null;
      base.updatedBy = this.userIds[+data.LastModifierUserId] ?? null;
      base.deletedBy = this.userIds[+data.DeleterUserId] ?? null;
    }

    return base;
  }

  private mapUser(user: IAbpUsers): User {
    const base = this.constructBase(user);
    return {
      ...base,
      userName: user.UserName,
      emailAddress: user.EmailAddress,
      name: user.Name,
      surname: user.Surname,
      password: null,
      phoneNumber: user.PhoneNumber,
      isActive: user.IsActive,
      avatar: user.Avatar,
      komuUserName: user.KomuUserName,
      komuUserId: user.KomuUserId,
      userCode: user.UserCode,
      imsv1EntityId: +user.Id,
      imsv1EntityName: USERSv1_NAME,
    };
  }

  private mapNews(news: INews, entityName: string): News {
    const base = this.constructBase(news);
    return {
      ...base,
      title: news.Title,
      description: news.Description,
      sapo: news.ShortDescription,
      priority: news.Piority,
      status: news.Status,
      effectiveStartTime: news.EffectiveStartTime,
      effectiveEndTime: news.EffectiveEndTime,
      thumbnailImage: rewriteS3Prefix(news.Image),
      coverImage: rewriteS3Prefix(news.CoverImage),
      allowLike: true,
      imsv1EntityId: +news.Id,
      imsv1EntityName: entityName,
      entityTypeId: +news.EntityTypeId,
      publishedTime: convertLocalDateTimeToUTC(base.createdTime),
      publishedBy: base.updatedBy || base.createdBy,
    };
  }

  private mapQNews(qnews: IQuickNews): QuickNews {
    const base = this.constructBase(qnews);
    return {
      ...base,
      description: qnews.Description,
      imsv1EntityId: +qnews.Id,
      imsv1EntityName: QNEWSv1_NAME,
    };
  }

  private mapComments(comment: IComments, entityName: string): Comment {
    const base = this.constructBase(comment);

    let parentId = null;
    if (comment.MainCommentId)
      parentId = this.cmtIds[MAIN_CMTv1_NAME][+comment.MainCommentId] ?? null;

    const entityTableName =
      comment.EntityName !== 'GuildLine'
        ? EntityV1Map[comment.EntityName as keyof typeof EntityV1Map]
        : GUIDELINESv1_NAME;
    const entityTable = this.newsIds[entityTableName];
    const newsId = entityTable ? entityTable[+comment.EntityId] : null;

    return {
      ...base,
      parentCommentId: parentId,
      comment: comment.Comment,
      newsId: newsId,
      imsv1EntityId: +comment.Id,
      imsv1EntityName: entityName,
    };
  }

  private mapLikes(
    likes: IUserLikes,
    entityName: string,
    entityNewId: number,
  ): UserLike {
    return {
      id: 1,
      userId:
        this.userIds[+likes.UserId] ??
        this.userIds[+likes.CreatorUserId] ??
        null,
      liked: likes.IsLiked ?? likes.Liked ?? null,
      imsv1EntityName: entityName,
      imsv1EntityId: +likes.Id,
      entityId: entityNewId,
      entityName: [UL_MAIN_CMTv1_NAME, UL_SUB_CMTv1_NAME].includes(entityName)
        ? LikeableEntity.Comments
        : LikeableEntity.News,
    };
  }

  private mapSetting(setting: IAbpSettings): Setting {
    return {
      id: +setting.Id + 1,
      name: setting.Name,
      value: setting.Value,
    };
  }

  private mapEntityType(enTy: IEntityType): EntityType {
    const entityNewKey = EntityV1Map[enTy.Entity as keyof typeof EntityV1Map];
    const entityName = EntityName[entityNewKey];

    return {
      id: +enTy.Id,
      displayName: enTy.TypeName,
      imsv1EntityName: 'EntityType',
      entityName: entityName,
      imsv1EntityId: +enTy.Id,
      color: null,
    };
  }

  private mapAlbums(album: ITraditionAlbums): TraditionalAlbums {
    const base = this.constructBase(album);
    return {
      ...base,
      title: album.Title,
      description: album.Description,
      entityTypeId: this.entityIds.TraditionAlbums[0],
      thumbnailImage: album.Image ? rewriteS3Prefix(album.Image) : '',
      albumIndex: +album.AlbumIndex,
      albumUrl: album.AlbumUrl,
      albumTime: album.AlbumTime,
      imsv1EntityId: +album.Id,
      imsv1EntityName: ALBUMSv1_NAME,
      isActive: true,
    };
  }

  async mergeUser() {
    const UsersV1 = await this.get<IAbpUsers[]>(USERSv1_NAME);
    const users = UsersV1.map((user) => this.mapUser(user));
    await this.userService.deleteBy(this.imsFilter);
    const usersRes = await this.userService.add(users);
    const userIdMap = usersRes.map(
      (x) =>
        <Ids>{
          id: x.id,
          imsv1EntityId: x.imsv1EntityId,
        },
    );
    this.userIds = mapId(userIdMap);
  }

  async mergeNews() {
    const NewsV1 = await Promise.all([
      this.get<INews[]>(NEWSv1_NAME),
      this.get<INews[]>(EVENTSv1_NAME),
      this.get<INews[]>(POLICIESv1_NAME),
      this.get<INews[]>(GUIDELINESv1_NAME),
    ]);

    const news = [
      ...NewsV1[0].map((news) => this.mapNews(news, NEWSv1_NAME)),
      ...NewsV1[1].map((news) => this.mapNews(news, EVENTSv1_NAME)),
      ...NewsV1[2].map((news) => this.mapNews(news, POLICIESv1_NAME)),
      ...NewsV1[3].map((news) => this.mapNews(news, GUIDELINESv1_NAME)),
    ];

    await this.cmsService.deleteNewsBy(this.imsFilter);
    const newsRes = await this.cmsService.insertNews(news);

    //group newsRes by imsv1EntityName,
    const groupIds: {
      [key: string]: News[];
    } = {};
    newsRes.forEach((news) => {
      if (!groupIds[news.imsv1EntityName]) groupIds[news.imsv1EntityName] = [];
      groupIds[news.imsv1EntityName].push(news);
    });

    // map to newsIds
    for (const names in groupIds) this.newsIds[names] = mapId(groupIds[names]);
  }

  async mergeQNews() {
    const QNewsV1 = await this.get<IQuickNews[]>(QNEWSv1_NAME);
    const qnews = QNewsV1.map((qnews) => this.mapQNews(qnews));

    await this.cmsService.deleteQNews(this.imsFilter);
    return this.cmsService.insertQNews(qnews);
  }

  async mergeSetting() {
    const SettingV1 = await this.get<IAbpSettings[]>(SETTINGv1_NAME, {
      whereFilter: 'UserId IS NULL',
    });
    const settings = SettingV1.map((setting) => this.mapSetting(setting));
    await this.settingRepo.delete({
      name: Not('defaultWidgetLayout'),
    });
    return this.settingRepo.save(settings);
  }

  async mergeEntityType() {
    const EntityTypeV1 = await this.get<IEntityType[]>(ENTITY_TYPEv1_NAME);
    const newEntityTypes = EntityTypeV1.map((entitytype) =>
      this.mapEntityType(entitytype),
    );
    newEntityTypes.push({
      id: generateNewId(EntityTypeV1.map((e) => +e.Id)),
      displayName: 'Album',
      imsv1EntityName: 'EntityType',
      entityName: EntityName.TraditionAlbums,
      imsv1EntityId: null,
      color: null,
    });

    await this.enTyRepo.delete(this.imsFilter);
    const entityTypes = await this.enTyRepo.save(newEntityTypes);
    entityTypes.forEach((e) => {
      if (!this.entityIds[e.entityName]) this.entityIds[e.entityName] = [];
      this.entityIds[e.entityName].push(e.id);
    });
  }

  async mergeComments() {
    const CommentsV1 = await Promise.all([
      this.get<IComments[]>(MAIN_CMTv1_NAME),
      this.get<IComments[]>(SUB_CMTv1_NAME),
    ]);

    const mainCmts = CommentsV1[0]
      .map((cmt) => this.mapComments(cmt, MAIN_CMTv1_NAME))
      .filter((cmt) => cmt.comment);

    this.cmtService.deleteMany(this.imsFilter);
    const mainRes = await this.cmtService.insertMany(mainCmts);

    this.cmtIds[MAIN_CMTv1_NAME] = mapId(mainRes);

    const subCmts = CommentsV1[1]
      .map((cmt) => {
        return this.mapComments(cmt, SUB_CMTv1_NAME);
      })
      .filter((cmt) => cmt.comment);

    const subRes = await this.cmtService.insertMany(subCmts);

    this.cmtIds[SUB_CMTv1_NAME] = mapId(subRes);
  }

  async mergeLikes() {
    const [MainCmtsV1, SubCmtsV1, EventsV1, GuidelinesV1, NewsV1, PoliciesV1] =
      await Promise.all([
        this.get<IUserLikes[]>(UL_MAIN_CMTv1_NAME),
        this.get<IUserLikes[]>(UL_SUB_CMTv1_NAME),
        this.get<IUserLikes[]>(UL_DL_EVENTSv1_NAME),
        this.get<IUserLikes[]>(UL_DL_GLv1_NAME),
        this.get<IUserLikes[]>(UL_DL_NEWSv1_NAME),
        this.get<IUserLikes[]>(UL_DL_POLv1_NAME),
      ]);

    const mainCmts = MainCmtsV1.map((cmt) => {
      const entityId = this.cmtIds[MAIN_CMTv1_NAME][+cmt.MainCommentId];
      return this.mapLikes(cmt, UL_MAIN_CMTv1_NAME, entityId);
    });

    const subCmts = SubCmtsV1.map((cmt) => {
      const entityId = this.cmtIds[SUB_CMTv1_NAME][+cmt.SubCommentId];
      return this.mapLikes(cmt, UL_SUB_CMTv1_NAME, entityId);
    });

    const events = EventsV1.map((e) => {
      const entityId = this.newsIds[EVENTSv1_NAME][+e.EventId];
      return this.mapLikes(e, UL_DL_EVENTSv1_NAME, entityId);
    });

    const guidelines = GuidelinesV1.map((g) => {
      const entityId = this.newsIds[GUIDELINESv1_NAME][+g.GuideLineId];
      return this.mapLikes(g, UL_DL_GLv1_NAME, entityId);
    });

    const news = NewsV1.map((n) => {
      const entityId = this.newsIds[NEWSv1_NAME][+n.NewsId];
      return this.mapLikes(n, UL_DL_NEWSv1_NAME, entityId);
    });

    const policies = PoliciesV1.map((p) => {
      const entityId = this.newsIds[POLICIESv1_NAME][+p.PoliciesId];
      return this.mapLikes(p, UL_DL_POLv1_NAME, entityId);
    });

    const userLikes = [
      ...mainCmts,
      ...subCmts,
      ...events,
      ...guidelines,
      ...news,
      ...policies,
    ].filter((like) => like.userId && like.liked !== null && like.entityId);

    await this.likesService.deleteMany(this.imsFilter);
    await this.likesService.insertMany(userLikes);
  }

  async mergeAlbums() {
    const AlbumsV1 = await this.get<ITraditionAlbums[]>(ALBUMSv1_NAME);
    const albums = AlbumsV1.map((al) => this.mapAlbums(al));

    await this.albumsService.deleteMany(this.imsFilter);
    await this.albumsService.insertMany(albums);
  }

  async mergeDataFromV1() {
    const totalUser = await this.userService.count();
    if (totalUser === 0) {
      await this.mergeUser();
      await Promise.all([this.mergeSetting(), this.mergeEntityType()]);
      await Promise.all([this.mergeNews(), this.mergeQNews()]);
      await this.mergeComments();
      await Promise.all([this.mergeLikes(), this.mergeAlbums()]);
    }

    return { status: 'OK', message: 'Merge successfully' };
  }
}
