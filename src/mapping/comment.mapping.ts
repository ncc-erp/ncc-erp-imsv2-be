import { ReturnCommentDto } from '@/features/comment/dto/return-comment.dto';
import { formatImageUrl } from '@/utils/url';

export function toReturnCommentDto(comment: any): ReturnCommentDto {
  return {
    id: comment.comment_id,
    createdTime: comment.comment_createdTime,
    comment: comment.comment_comment,
    parentCommentId: comment.comment_parentCommentId,
    newsId: comment.comment_newsId,
    likesCount: Number(comment.countLike),
    hasCurrentUserLiked: Number(comment.liked) === 1,
    user: {
      userId: comment.comment_createdBy,
      avatar: formatImageUrl(comment.avatar),
      userName: comment.userName,
      name: comment.name,
    },
  };
}
