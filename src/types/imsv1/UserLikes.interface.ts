export interface IUserLikes {
  Id: string;
  EntityName: string;
  UserId: string;
  CreatorUserId: string;
  IsLiked?: boolean;
  Liked?: boolean;
  EventId?: string;
  MainCommentId?: string;
  GuideLineId?: string;
  NewsId?: string;
  PoliciesId?: string;
  SubCommentId?: string;
}
