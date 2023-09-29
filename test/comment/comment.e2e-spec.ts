import { faker } from '@faker-js/faker';
import { News } from '../../src/entities/news.entity';
import { CMSService } from '../../src/features/cms/cms.service';
import { CommentService } from '../../src/features/comment/comment.service';
import { CommentDto } from '../../src/features/comment/dto/comment.dto';
import { EntityTypeService } from '../../src/features/entity-type/entity-type.service';
import { EntityName } from '../../src/types/entityName.enum';
import { BaseTest } from '../base/base.test';
import { Comment } from '../../src/entities/comment.entity';

class CommentTest extends BaseTest {
  commentService: CommentService;
  constructor() {
    super();
  }

  async createComment(
    newsId: number,
    userId: number,
    parentCommentId?: number,
  ) {
    const commentDto = {
      comment: faker.commerce.productDescription(),
      newsId,
      createdBy: userId,
      ...(parentCommentId && {
        parentCommentId,
      }),
    } as CommentDto;
    await this.commentService.insertMany([commentDto]);
  }
}

describe('Comment', () => {
  const URI = '/comment';
  let test: CommentTest;
  let accessToken: string;
  let news: News;

  beforeAll(async () => {
    test = await new CommentTest().init();
    test.commentService = test.module.get(CommentService);
    accessToken = await test.login(test.admin.emailAddress);
    const entityTypeService = test.module.get(EntityTypeService);
    const newsCategory = await test.createEntityType(
      entityTypeService,
      EntityName.News,
    );
    const cmsService = test.module.get(CMSService);
    [news] = await test.createApprovedNews(cmsService, newsCategory.id);
    await test.mockGetUserInfoByEmail();
    await test.mockUploadImage();
  });

  afterAll(async () => {
    await test.destroy();
  });

  beforeEach(async () => {
    await test.createComment(news.id, test.staff.id);
  });

  afterEach(async () => {
    await test.truncateTable([Comment.name]);
  });

  it('should get comment of news successfully', async () => {
    const response = await test
      .get(URI, accessToken)
      .query(`newsId=${news.id}`)
      .expect(200);
    expect(response.body.length).toBe(1);
  });

  it('should get detail comment successfully', async () => {
    const commentOfNews = await test
      .get(URI, accessToken)
      .query(`newsId=${news.id}`)
      .expect(200);
    const body = commentOfNews.body[0];
    const response = await test
      .get(`${URI}/${body.id}`, accessToken)
      .expect(200);

    expect(response.body).toBeDefined();
  });

  it('should update comment successfully', async () => {
    const commentOfNews = await test
      .get(URI, accessToken)
      .query(`newsId=${news.id}`)
      .expect(200);
    const staffToken = await test.login(test.staff.emailAddress);
    const body = commentOfNews.body[0];
    const expectComment = faker.animal.bear();
    await test
      .put(`${URI}/${body.id}`, staffToken)
      .send({
        comment: expectComment,
      })
      .expect(200);
    const response = await test
      .get(`${URI}/${body.id}`, accessToken)
      .expect(200);
    expect(response.body.comment).toBe(expectComment);
  });

  it('should delete comment successfully', async () => {
    const commentOfNews = await test
      .get(URI, accessToken)
      .query(`newsId=${news.id}`)
      .expect(200);

    await test
      .delete(`${URI}/${commentOfNews.body[0].id}`, accessToken)
      .expect(200);

    const commentOfNewsUpdate = await test
      .get(URI, accessToken)
      .query(`newsId=${news.id}`)
      .expect(200);

    expect(commentOfNewsUpdate.body.length).toBe(0);
  });

  it('should like comment successfully', async () => {
    const commentOfNews = await test
      .get(URI, accessToken)
      .query(`newsId=${news.id}`)
      .expect(200);

    await test
      .post(`${URI}/like/${commentOfNews.body[0].id}`, accessToken)
      .query('liked=true')

      .expect(201);

    const commentOfNewsUpdate = await test
      .get(URI, accessToken)
      .query(`newsId=${news.id}`)
      .expect(200);

    expect(commentOfNewsUpdate.body[0].likesCount).toBe(1);
  });
});
