import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWidgetTable1677086899766 implements MigrationInterface {
  name = 'AddWidgetTable1677086899766';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "widget"
       (
         "id"             SERIAL            NOT NULL,
         "entityTypeId"   integer           NOT NULL,
         "code"           integer           NOT NULL,
         "title"          character varying NOT NULL,
         "description"    character varying,
         "thumbnailImage" character varying,
         "defaultHeight"  integer           NOT NULL DEFAULT '1',
         "defaultWidth"   integer           NOT NULL DEFAULT '1',
         "maxHeight"      integer           NOT NULL DEFAULT '4',
         "maxWidth"       integer           NOT NULL DEFAULT '4',
         "url"            character varying,
         "isEnabled"      boolean           NOT NULL DEFAULT true,
         CONSTRAINT "UQ_4b5beaf95b946883f8174a2a528" UNIQUE ("code"),
         CONSTRAINT "PK_feb5fda4f8d30bbe0022f4ca804" PRIMARY KEY ("id")
       )`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_widget"
       (
         "id"       SERIAL  NOT NULL,
         "title"    character varying,
         "height"   integer NOT NULL DEFAULT '1',
         "width"    integer NOT NULL DEFAULT '1',
         "posX"     integer NOT NULL DEFAULT '0',
         "posY"     integer NOT NULL DEFAULT '0',
         "userId"   integer,
         "widgetId" integer,
         CONSTRAINT "PK_1c2b802db6261e06a08c5698893" PRIMARY KEY ("id")
       )`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_widget"
        ADD CONSTRAINT "FK_88c8316182b0d3a6a00958f5415" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_widget"
        ADD CONSTRAINT "FK_a89146bdcb0e8c28620feff8632" FOREIGN KEY ("widgetId") REFERENCES "widget" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_widget"
        DROP CONSTRAINT "FK_a89146bdcb0e8c28620feff8632"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_widget"
        DROP CONSTRAINT "FK_88c8316182b0d3a6a00958f5415"`,
    );
    await queryRunner.query(`DROP TABLE "user_widget"`);
    await queryRunner.query(`DROP TABLE "widget"`);
  }
}
