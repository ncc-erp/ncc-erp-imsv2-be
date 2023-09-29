import { MigrationInterface, QueryRunner } from 'typeorm';

export class LinkWidgetsEntityType1677832532523 implements MigrationInterface {
  name = 'LinkWidgetsEntityType1677832532523';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "widget"
        ALTER COLUMN "entityTypeId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "widget"
        ADD CONSTRAINT "FK_29b2d3470f07a459db74a285034" FOREIGN KEY ("entityTypeId") REFERENCES "entity_type" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment"
        ADD CONSTRAINT "FK_725c4f36102e5e9599cfb2ce580" FOREIGN KEY ("newsId") REFERENCES "news" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comment"
        DROP CONSTRAINT "FK_725c4f36102e5e9599cfb2ce580"`,
    );
    await queryRunner.query(
      `ALTER TABLE "widget"
        DROP CONSTRAINT "FK_29b2d3470f07a459db74a285034"`,
    );
    await queryRunner.query(
      `ALTER TABLE "widget"
        ALTER COLUMN "entityTypeId" SET NOT NULL`,
    );
  }
}
