import { TraditionalAlbums } from '@entities/album.entity';
import { faker } from '@faker-js/faker';
import { AlbumsService } from '@features/albums/albums.service';
import { AlbumsDTO } from '@features/albums/dto/albums.dto';
import { EntityTypeService } from '@features/entity-type/entity-type.service';
import { EntityName } from '@type/entityName.enum';
import { BaseTest } from '../base/base.test';

export class AlbumTest extends BaseTest {
  traditionalAlbumId: number;

  constructor() {
    super();
  }

  async createTraditionalAlbumEntityType() {
    const entityTypeService = this.module.get(EntityTypeService);
    const traditionalAlbumEntity = await entityTypeService.createEntityType({
      entityName: EntityName.TraditionAlbums,
      displayName: faker.string.sample(10),
      isActive: true,
    });
    this.traditionalAlbumId = traditionalAlbumEntity.id;
  }

  async createAlbums(numberAlbums = 1) {
    const albumsService = this.module.get(AlbumsService);
    const albums: TraditionalAlbums[] = [];
    for (let i = 0; i < numberAlbums; i++) {
      const traditionalAlbums = albumsService.create({
        title: faker.string.sample(10),
        albumTime: faker.date.recent({ days: 10 }),
        albumIndex: 1,
        albumUrl: faker.internet.url(),
        entityTypeId: this.traditionalAlbumId,
        thumbnailImage: faker.image.url(),
      });
      albums.push(traditionalAlbums);
    }

    return await albumsService.saveAll(albums);
  }
}

describe('Album', () => {
  const URI = '/albums';
  let test: AlbumTest;
  let accessToken: string;

  beforeAll(async () => {
    test = await new AlbumTest().init();
    await test.createTraditionalAlbumEntityType();
    accessToken = await test.login(test.staff.emailAddress);
  });

  afterAll(async () => {
    await test.destroy();
  });

  afterEach(async () => {
    await test.truncateTable([TraditionalAlbums]);
  });

  it('should get albums default order by albumTime', async () => {
    const expectNumberAlbums = 10;
    await test.createAlbums(expectNumberAlbums);
    const response = await test
      .get(URI, accessToken)
      .query(`size=${expectNumberAlbums}`)
      .expect(200);
    const album = response.body.data as AlbumsDTO[];
    expect(album.length).toBe(expectNumberAlbums);
    const isSortedDesc = album
      .map((album) => new Date(album.albumTime))
      .every((date, index, dates) => {
        if (index === 0) return true;
        return date < dates[index - 1];
      });
    expect(isSortedDesc).toBe(true);
  });

  it('Should delete album successfully', async () => {
    accessToken = await test.login(test.admin.emailAddress);
    const [album] = await test.createAlbums();
    return test.delete(URI + `/${album.id}`, accessToken).expect(200);
  });

  it('Should create album successfully', async () => {
    accessToken = await test.login(test.admin.emailAddress);
    test.mockUploadImage();
    const albumUrl = faker.image.urlLoremFlickr();
    const title = faker.animal.crocodilia();
    const albumTime = faker.date.recent().toISOString();
    await test
      .post(URI, accessToken)
      .set('Content-Type', 'multipart/form-data')
      .field('albumUrl', albumUrl)
      .field('albumIndex', '')
      .field('isActive', 'true')
      .field('title', title)
      .field('categoryId', test.traditionalAlbumId)
      .field('albumTime', albumTime)
      .field('description', '')
      .attach('thumbnailImageFile', 'test/resources/images/arrowUp.gif')
      .expect(201);

    const response = await test.get(URI, accessToken).expect(200);
    expect(response.body.data.length).toBe(1);
    const [album] = response.body.data as AlbumsDTO[];
    expect(album.albumUrl).toBe(albumUrl);
    expect(album.title).toBe(title);
    expect(album.albumTime).toBe(albumTime);
    expect(album.isActive).toBe(true);
  });

  it('Should update album successfully', async () => {
    accessToken = await test.login(test.admin.emailAddress);
    const [album] = await test.createAlbums();
    test.mockUploadImage();
    const albumUrl = faker.image.urlLoremFlickr();
    const title = faker.animal.crocodilia();
    const albumTime = faker.date.recent().toISOString();
    await test
      .put(URI + `/${album.id}`, accessToken)
      .set('Content-Type', 'multipart/form-data')
      .field('albumUrl', albumUrl)
      .field('albumIndex', album.albumIndex)
      .field('isActive', 'true')
      .field('title', title)
      .field('categoryId', test.traditionalAlbumId)
      .field('albumTime', albumTime)
      .field('description', '')
      .attach('thumbnailImageFile', 'test/resources/images/arrowUp.gif')
      .expect(200);

    const response = await test
      .get(URI + `/${album.id}`, accessToken)
      .expect(200);

    const albumUpdate = response.body as AlbumsDTO;
    expect(albumUpdate.albumUrl).toBe(albumUrl);
    expect(albumUpdate.title).toBe(title);
    expect(albumUpdate.albumTime).toBe(albumTime);
  });
});
