import { News } from '@entities/news.entity';
import { faker } from '@faker-js/faker';
import { SearchFilter } from '@features/cms/dto/search-filter.dto';
import { EntityTypeService } from '@features/entity-type/entity-type.service';
import { EntityName, NewsCategories } from '@type/entityName.enum';
import { CMSService } from '../../src/features/cms/cms.service';
import { NewsDTO } from '../../src/features/cms/dto/news.dto';
import { EntityTypeDTO } from '../../src/features/entity-type/dto/entity-type.dto';
import { Priority } from '../../src/types/priority.enum';
import { StatusType } from '../../src/types/status.enum';
import { BaseTest } from '../base/base.test';

export class NewsTest extends BaseTest {
  subCategoryIds = new Map<EntityName, EntityTypeDTO>();

  constructor() {
    super();
  }

  async createSubCategory() {
    const entityTypeService = this.module.get(EntityTypeService);
    for (const name of NewsCategories.map((category) => category.id)) {
      const subCategory = await this.createEntityType(entityTypeService, name);
      this.subCategoryIds.set(subCategory.entityName, subCategory);
    }
  }

  async createNews() {
    const cmsService = this.module.get(CMSService);
    for (const category of this.subCategoryIds.values()) {
      await this.createApprovedNews(cmsService, category.id);
    }
  }
  async createNewsDraft(URI: string, accessToken: string) {
    return await this.post(URI, accessToken)
      .set('Content-Type', 'multipart/form-data')
      .field('title', faker.commerce.productName())
      .field('description', faker.commerce.productDescription())
      .field('priority', Priority.High)
      .field('publishedTime', faker.date.recent().toISOString())
      .field('mainCategory', EntityName.News)
      .field(
        'subCategory',
        this.subCategoryIds.get(EntityName.News).displayName,
      )
      .attach('thumbnailImageFile', 'test/resources/images/arrowUp.gif')
      .attach('coverImageFile', 'test/resources/images/arrowUp.gif')
      .expect(201);
  }
}

describe('News', () => {
  const URI = '/news';
  let test: NewsTest;
  let accessToken: string;

  beforeAll(async () => {
    test = await new NewsTest().init();
    accessToken = await test.login(test.admin.emailAddress);
    await test.createSubCategory();
    await test.mockGetUserInfoByEmail();
    await test.mockUploadImage();
  });

  afterAll(async () => {
    await test.destroy();
  });

  beforeEach(async () => {
    await test.createNews();
  });

  afterEach(async () => {
    await test.truncateTable([News.name]);
  });

  it('should get list search filter successfully', async () => {
    const response = await test
      .get(`${URI}/search-filters`, accessToken)
      .expect(200);
    const searchFilter = response.body as SearchFilter;
    expect(searchFilter.mainCategories.length).toBe(NewsCategories.length);
    expect(searchFilter.subCategories).toBeDefined();
  });

  it('should get list latest new successfully', async () => {
    const response = await test.get(`${URI}/latest`, accessToken).expect(200);
    const news = response.body as NewsDTO[];
    expect(news.length).toBe(NewsCategories.length);
    for (const value of news) {
      expect(value.subCategory).toBe(
        test.subCategoryIds.get(value.mainCategory as EntityName).displayName,
      );
    }
  });

  it('should get list new successfully', async () => {
    const response = await test.get(URI, accessToken).expect(200);
    const news = response.body.data as NewsDTO[];
    expect(news.length).toBe(NewsCategories.length);
    for (const value of news) {
      expect(value.subCategory).toBe(
        test.subCategoryIds.get(value.mainCategory as EntityName).displayName,
      );
    }
  });

  it('should create news successfully', async () => {
    const response = await test.createNewsDraft(URI, accessToken);

    expect(response.body.newsId).toBeDefined();

    const news = await test
      .get(`${URI}/admin/details/${response.body.newsId}`, accessToken)
      .expect(200);

    const body = news.body as NewsDTO;
    expect(body.status).toBe(StatusType.Draft);
    expect(body.mainCategory).toBe(EntityName.News);
    expect(body.subCategory).toBe(
      test.subCategoryIds.get(EntityName.News).displayName,
    );
  });

  it('should create news and published successfully', async () => {
    const response = await test
      .post(`${URI}/save-publish`, accessToken)
      .set('Content-Type', 'multipart/form-data')
      .field('title', faker.commerce.productName())
      .field('description', faker.commerce.productDescription())
      .field('priority', Priority.High)
      .field('publishedTime', faker.date.recent().toISOString())
      .field('mainCategory', EntityName.News)
      .field(
        'subCategory',
        test.subCategoryIds.get(EntityName.News).displayName,
      )
      .attach('thumbnailImageFile', 'test/resources/images/arrowUp.gif')
      .attach('coverImageFile', 'test/resources/images/arrowUp.gif')
      .expect(202);

    expect(response.body.news).toBeDefined();

    const news = await test
      .get(`${URI}/admin/details/${response.body.news}`, accessToken)
      .expect(200);

    const body = news.body as NewsDTO;
    expect(body.status).toBe(StatusType.Approved);
    expect(body.mainCategory).toBe(EntityName.News);
    expect(body.subCategory).toBe(
      test.subCategoryIds.get(EntityName.News).displayName,
    );
  });

  it('should delete news successfully', async () => {
    const response = await test.get(URI, accessToken).expect(200);
    const news = response.body.data[1] as NewsDTO;
    await test.delete(`${URI}/${news.id}`, accessToken).expect(200);
  });

  it('should submit news successfully', async () => {
    const response = await test.createNewsDraft(URI, accessToken);
    expect(response.body.newsId).toBeDefined();

    await test
      .post(`${URI}/submit/${response.body.newsId}`, accessToken)
      .expect(201);

    const news = await test
      .get(`${URI}/admin/details/${response.body.newsId}`, accessToken)
      .expect(200);

    const body = news.body as NewsDTO;
    expect(body.status).toBe(StatusType.Waiting);
  });

  it('should publish news successfully', async () => {
    const response = await test.createNewsDraft(URI, accessToken);
    expect(response.body.newsId).toBeDefined();

    await test
      .post(`${URI}/submit/${response.body.newsId}`, accessToken)
      .expect(201);
    await test
      .post(`${URI}/publish/${response.body.newsId}`, accessToken)
      .expect(201);

    const news = await test
      .get(`${URI}/admin/details/${response.body.newsId}`, accessToken)
      .expect(200);

    const body = news.body as NewsDTO;
    expect(body.status).toBe(StatusType.Approved);
  });

  it('should unpublish news successfully', async () => {
    const response = await test.get(URI, accessToken).expect(200);
    const news = response.body.data[1] as NewsDTO;
    await test.post(`${URI}/unpublish/${news.id}`, accessToken).expect(201);

    const newsUpdate = await test
      .get(`${URI}/admin/details/${news.id}`, accessToken)
      .expect(200);

    const body = newsUpdate.body as NewsDTO;
    expect(body.status).toBe(StatusType.Hidden);
  });

  it('should like news successfully', async () => {
    const response = await test.get(URI, accessToken).expect(200);
    const news = response.body.data[1] as NewsDTO;
    await test.post(`${URI}/like/${news.id}`, accessToken).expect(201);
  });
});
