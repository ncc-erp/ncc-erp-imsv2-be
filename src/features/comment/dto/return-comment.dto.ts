export class NestedUserInComment {
  userId: number;
  avatar: string;
  userName: string;
  name: string;
}

export class ReturnCommentDto {
  id: number;
  createdTime: string;
  comment: string;
  parentCommentId: number;
  newsId: number;
  likesCount: number;
  hasCurrentUserLiked: boolean;
  user: NestedUserInComment;
}
