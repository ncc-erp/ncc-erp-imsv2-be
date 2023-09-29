import { AppModule } from '@/app.module';
import { constructClientFormatObj } from '@/mapping/rolePermissions.mapping';
import { AuditLog } from '@entities/audit-log.entity';
import { User } from '@entities/user.entity';
import { faker } from '@faker-js/faker';
import { AuditLogService } from '@features/audit-log/audit-log.service';
import { AuthenticationService } from '@features/authentication/authentication.service';
import { UpdatePermissionsDTO } from '@features/role/dto/update-permissions.dto';
import { RoleService } from '@features/role/role.service';
import { UserService } from '@features/user/user.service';
import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { Mission } from '@type/authorization/mission.enum';
import { RoleName } from '@type/authorization/role.enum';
import { useContainer } from 'class-validator';
import * as process from 'process';
import supertest, * as request from 'supertest';
import { PostgreSqlContainer } from 'testcontainers';
import { StartedPostgreSqlContainer } from 'testcontainers/dist/src/modules/postgresql/postgresql-container';
import { DataSource, EntityTarget } from 'typeorm';
import { CMSService } from '../../src/features/cms/cms.service';
import { EntityTypeService } from '../../src/features/entity-type/entity-type.service';
import { FilesService } from '../../src/features/files/files.service';
import { UserInfoDTO } from '../../src/features/hrmv2/dto/user-info.dto';
import { Hrmv2Service } from '../../src/features/hrmv2/hrmv2.service';
import { EntityName } from '../../src/types/entityName.enum';
import { Priority } from '../../src/types/priority.enum';
import { StatusType } from '../../src/types/status.enum';

export abstract class BaseTest {
  app: INestApplication;
  postgresContainer: StartedPostgreSqlContainer;
  http: supertest.SuperTest<supertest.Test>;
  module: TestingModule;
  dataSource: DataSource;
  accessToken: string;
  staff: User;
  admin: User;
  hr: User;
  intern: User;

  async init() {
    await this.setup();
    await this.createUsers();
    return this;
  }

  async setup(): Promise<void> {
    this.postgresContainer = await new PostgreSqlContainer()
      .withDatabase('imsv2')
      .start();

    this.dataSource = new DataSource({
      name: 'default',
      type: 'postgres',
      database: this.postgresContainer.getDatabase(),
      host: this.postgresContainer.getHost(),
      port: this.postgresContainer.getPort(),
      username: this.postgresContainer.getUsername(),
      password: this.postgresContainer.getPassword(),
      synchronize: false,
      logging: process.env.DB_LOGGING?.toLowerCase() === 'true',
      entities: ['src/entities/*.entity.ts'],
      migrations: ['dist/migrations/*.js'],
      subscribers: [],
      schema: process.env.DB_SCHEMA ?? 'public',
      migrationsRun: true,
    });

    await this.dataSource.initialize();

    this.module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DataSource)
      .useValue(this.dataSource)
      .compile();

    this.app = this.module.createNestApplication();
    this.app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );
    useContainer(this.app.select(AppModule), { fallbackOnErrors: true });
    this.app.useGlobalInterceptors(
      new ClassSerializerInterceptor(this.app.get(Reflector)),
    );
    await this.app.init();
    this.http = request(this.app.getHttpServer());

    const authService = this.module.get(AuthenticationService);
    jest
      .spyOn(authService, 'validateGoogleToken')
      .mockImplementation(async (email) => Promise.resolve(email));

    const auditLogService = this.module.get(AuditLogService);
    jest.spyOn(auditLogService, 'save').mockResolvedValue(new AuditLog());
  }

  async destroy() {
    await this.app.close();
    await this.postgresContainer.stop({ timeout: 2000 });
  }

  async truncateTable(names: EntityTarget<any>[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      for (const name of names) {
        const metadata = this.dataSource.getMetadata(name);
        if (!metadata) throw new Error(`Table ${name} doesn't exits`);
        await queryRunner.query(`TRUNCATE TABLE ${metadata.tableName} CASCADE`);
      }
      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  async createUsers() {
    const roleService = this.module.get(RoleService);
    const userService = this.module.get(UserService);

    const roles = await roleService.getManyRole({});

    const users = roles.map((role) => {
      const user = userService.create({
        userName: faker.internet.userName(),
        emailAddress: faker.internet.email(),
        isActive: true,
      });
      user.roles = [role];
      return user;
    });

    const saveUser = await userService.add(users);

    this.staff = saveUser.find((user) =>
      user.roles.map((role) => role.name).includes(RoleName.STAFF),
    );

    this.admin = saveUser.find((user) =>
      user.roles.map((role) => role.name).includes(RoleName.ADMIN),
    );

    this.hr = saveUser.find((user) =>
      user.roles.map((role) => role.name).includes(RoleName.HR),
    );

    this.intern = saveUser.find((user) =>
      user.roles.map((role) => role.name).includes(RoleName.INTERN),
    );
  }

  get(uri: string, token?: string) {
    return this.http
      .get(uri)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`);
  }

  post(uri: string, token?: string) {
    return this.http
      .post(uri)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`);
  }

  put(uri: string, token?: string) {
    return this.http
      .put(uri)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`);
  }

  delete(uri: string, token?: string) {
    return this.http
      .delete(uri)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`);
  }

  async login(email: string) {
    const response = await this.post('/auth/token').send({
      googleAuthToken: email,
    });
    return response.body.accessToken;
  }

  mockUploadImage() {
    const filesService = this.module.get(FilesService);
    jest
      .spyOn(filesService, 'getImagesKeys')
      .mockResolvedValue(faker.image.url());
  }

  mockGetUserInfoByEmail() {
    const hrmV2Service = this.module.get(Hrmv2Service);
    jest
      .spyOn(hrmV2Service, 'getUserInfoByEmail')
      .mockResolvedValue(new UserInfoDTO());
  }

  async createEntityType(
    entityTypeService: EntityTypeService,
    name: string | number,
  ) {
    return await entityTypeService.createEntityType({
      entityName: name as EntityName,
      displayName: faker.internet.domainName(),
      isActive: true,
    });
  }

  async createApprovedNews(cmsService: CMSService, categoryId: number) {
    const newsDTO = {
      title: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      priority: Priority.High,
      status: StatusType.Approved,
      entityTypeId: categoryId,
      thumbnailImage: faker.image.avatar(),
      coverImage: faker.image.avatar(),
      publishedBy: this.admin.id,
      publishedTime: faker.date.recent(),
      createdBy: this.admin.id,
    };
    const news = cmsService.create(newsDTO);
    return await cmsService.insertNews([news]);
  }
}
