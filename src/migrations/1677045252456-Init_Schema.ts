import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1677045252456 implements MigrationInterface {
  name = 'InitSchema1677045252456';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."entity_type_entityname_enum" AS ENUM('News', 'Events', 'Guidelines', 'Policies', 'Widgets', 'TraditionAlbums')`,
    );
    await queryRunner.query(
      `CREATE TABLE "entity_type"
       (
         "id"              integer                                NOT NULL,
         "entityName"      "public"."entity_type_entityname_enum" NOT NULL DEFAULT 'Events',
         "displayName"     character varying                      NOT NULL,
         "imsv1EntityName" character varying,
         "imsv1EntityId"   integer,
         "color"           character varying,
         CONSTRAINT "PK_a673aa035fbda0a8f4b1bf81286" PRIMARY KEY ("id")
       )`,
    );
    await queryRunner.query(
      `CREATE TABLE "traditional_albums"
       (
         "id"              SERIAL            NOT NULL,
         "createdBy"       integer,
         "createdTime"     TIMESTAMP         NOT NULL DEFAULT now(),
         "updatedBy"       integer,
         "updatedTime"     TIMESTAMP         NOT NULL DEFAULT now(),
         "deletedBy"       integer,
         "deletedTime"     TIMESTAMP,
         "isDeleted"       boolean           NOT NULL DEFAULT false,
         "title"           character varying NOT NULL,
         "description"     character varying NOT NULL,
         "entityTypeId"    integer,
         "thumbnailImage"  character varying NOT NULL,
         "albumIndex"      integer           NOT NULL,
         "albumUrl"        character varying NOT NULL,
         "albumTime"       TIMESTAMP         NOT NULL,
         "imsv1EntityId"   integer,
         "imsv1EntityName" character varying,
         CONSTRAINT "PK_f399be9737107358781c5e35526" PRIMARY KEY ("id")
       )`,
    );
    await queryRunner.query(
      `CREATE TABLE "quick_news"
       (
         "id"              SERIAL            NOT NULL,
         "createdBy"       integer,
         "createdTime"     TIMESTAMP         NOT NULL DEFAULT now(),
         "updatedBy"       integer,
         "updatedTime"     TIMESTAMP         NOT NULL DEFAULT now(),
         "deletedBy"       integer,
         "deletedTime"     TIMESTAMP,
         "isDeleted"       boolean           NOT NULL DEFAULT false,
         "description"     character varying NOT NULL,
         "imsv1EntityId"   integer,
         "imsv1EntityName" character varying,
         CONSTRAINT "PK_0b167a515b0ba10ad55baf57192" PRIMARY KEY ("id")
       )`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."news_status_enum" AS ENUM('1000', '2000', '3000', '4000', '5000', '6000')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."news_priority_enum" AS ENUM('1', '2', '3')`,
    );
    await queryRunner.query(
      `CREATE TABLE "news"
       (
         "id"                 SERIAL                        NOT NULL,
         "createdBy"          integer,
         "createdTime"        TIMESTAMP                     NOT NULL DEFAULT now(),
         "updatedBy"          integer,
         "updatedTime"        TIMESTAMP                     NOT NULL DEFAULT now(),
         "deletedBy"          integer,
         "deletedTime"        TIMESTAMP,
         "isDeleted"          boolean                       NOT NULL DEFAULT false,
         "title"              character varying             NOT NULL,
         "sapo"               character varying,
         "description"        character varying             NOT NULL,
         "entityTypeId"       integer                       NOT NULL,
         "status"             "public"."news_status_enum"   NOT NULL DEFAULT '1000',
         "priority"           "public"."news_priority_enum" NOT NULL DEFAULT '2',
         "thumbnailImage"     character varying,
         "coverImage"         character varying,
         "effectiveStartTime" TIMESTAMP,
         "effectiveEndTime"   TIMESTAMP,
         "allowLike"          boolean                       NOT NULL DEFAULT true,
         "imsv1EntityId"      integer,
         "imsv1EntityName"    character varying,
         "publishedTime"      TIMESTAMP,
         "publishedBy"        integer,
         CONSTRAINT "PK_39a43dfcb6007180f04aff2357e" PRIMARY KEY ("id")
       )`,
    );
    await queryRunner.query(
      `CREATE TABLE "user"
       (
         "id"              SERIAL            NOT NULL,
         "createdBy"       integer,
         "createdTime"     TIMESTAMP         NOT NULL DEFAULT now(),
         "updatedBy"       integer,
         "updatedTime"     TIMESTAMP         NOT NULL DEFAULT now(),
         "deletedBy"       integer,
         "deletedTime"     TIMESTAMP,
         "isDeleted"       boolean           NOT NULL DEFAULT false,
         "userName"        character varying NOT NULL,
         "emailAddress"    character varying NOT NULL,
         "name"            character varying,
         "surname"         character varying,
         "password"        character varying,
         "phoneNumber"     character varying,
         "isActive"        boolean           NOT NULL,
         "avatar"          character varying,
         "komuUserName"    character varying,
         "userCode"        character varying,
         "komuUserId"      character varying,
         "imsv1EntityId"   integer,
         "imsv1EntityName" character varying,
         CONSTRAINT "UQ_b9be34c88d94f2c69653cdf038c" UNIQUE ("userName", "emailAddress", "imsv1EntityId"),
         CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
       )`,
    );
    await queryRunner.query(
      `CREATE TABLE "role"
       (
         "id"   SERIAL            NOT NULL,
         "name" character varying NOT NULL,
         CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id")
       )`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."role_permission_actions_enum" AS ENUM('create', 'read', 'delete', 'update')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."role_permission_mission_enum" AS ENUM('cms', 'album', 'authorization', 'timesheet', 'hrm')`,
    );
    await queryRunner.query(
      `CREATE TABLE "role_permission"
       (
         "id"      SERIAL                                        NOT NULL,
         "actions" "public"."role_permission_actions_enum" array NOT NULL DEFAULT '{read}',
         "mission" "public"."role_permission_mission_enum"       NOT NULL,
         "roleId"  integer,
         CONSTRAINT "PK_96c8f1fd25538d3692024115b47" PRIMARY KEY ("id")
       )`,
    );
    await queryRunner.query(
      `CREATE TABLE "comment"
       (
         "id"              SERIAL            NOT NULL,
         "createdBy"       integer,
         "createdTime"     TIMESTAMP         NOT NULL DEFAULT now(),
         "updatedBy"       integer,
         "updatedTime"     TIMESTAMP         NOT NULL DEFAULT now(),
         "deletedBy"       integer,
         "deletedTime"     TIMESTAMP,
         "isDeleted"       boolean           NOT NULL DEFAULT false,
         "comment"         character varying NOT NULL,
         "parentCommentId" integer,
         "newsId"          integer,
         "imsv1EntityId"   integer,
         "imsv1EntityName" character varying,
         CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id")
       )`,
    );
    await queryRunner.query(
      `CREATE TABLE "setting"
       (
         "id"    integer           NOT NULL,
         "name"  character varying NOT NULL,
         "value" character varying NOT NULL,
         CONSTRAINT "PK_fcb21187dc6094e24a48f677bed" PRIMARY KEY ("id")
       )`,
    );
    await queryRunner.query(
      `CREATE TABLE "team"
       (
         "id"          integer           NOT NULL,
         "name"        character varying NOT NULL,
         "displayName" character varying NOT NULL,
         CONSTRAINT "PK_f57d8293406df4af348402e4b74" PRIMARY KEY ("id")
       )`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_like"
       (
         "id"              SERIAL            NOT NULL,
         "userId"          integer           NOT NULL,
         "entityId"        integer           NOT NULL,
         "entityName"      character varying NOT NULL,
         "liked"           boolean           NOT NULL,
         "imsv1EntityId"   integer,
         "imsv1EntityName" character varying,
         CONSTRAINT "PK_7ed1892691b28e1e1dfc34c4249" PRIMARY KEY ("id")
       )`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_roles_role"
       (
         "userId" integer NOT NULL,
         "roleId" integer NOT NULL,
         CONSTRAINT "PK_b47cd6c84ee205ac5a713718292" PRIMARY KEY ("userId", "roleId")
       )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5f9286e6c25594c6b88c108db7" ON "user_roles_role" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4be2f7adf862634f5f803d246b" ON "user_roles_role" ("roleId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission"
        ADD CONSTRAINT "FK_e3130a39c1e4a740d044e685730" FOREIGN KEY ("roleId") REFERENCES "role" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles_role"
        ADD CONSTRAINT "FK_5f9286e6c25594c6b88c108db77" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles_role"
        ADD CONSTRAINT "FK_4be2f7adf862634f5f803d246b8" FOREIGN KEY ("roleId") REFERENCES "role" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_roles_role"
        DROP CONSTRAINT "FK_4be2f7adf862634f5f803d246b8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles_role"
        DROP CONSTRAINT "FK_5f9286e6c25594c6b88c108db77"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission"
        DROP CONSTRAINT "FK_e3130a39c1e4a740d044e685730"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4be2f7adf862634f5f803d246b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5f9286e6c25594c6b88c108db7"`,
    );
    await queryRunner.query(`DROP TABLE "user_roles_role"`);
    await queryRunner.query(`DROP TABLE "user_like"`);
    await queryRunner.query(`DROP TABLE "team"`);
    await queryRunner.query(`DROP TABLE "setting"`);
    await queryRunner.query(`DROP TABLE "comment"`);
    await queryRunner.query(`DROP TABLE "role_permission"`);
    await queryRunner.query(
      `DROP TYPE "public"."role_permission_mission_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."role_permission_actions_enum"`,
    );
    await queryRunner.query(`DROP TABLE "role"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "news"`);
    await queryRunner.query(`DROP TYPE "public"."news_priority_enum"`);
    await queryRunner.query(`DROP TYPE "public"."news_status_enum"`);
    await queryRunner.query(`DROP TABLE "quick_news"`);
    await queryRunner.query(`DROP TABLE "traditional_albums"`);
    await queryRunner.query(`DROP TABLE "entity_type"`);
    await queryRunner.query(`DROP TYPE "public"."entity_type_entityname_enum"`);
  }
}
