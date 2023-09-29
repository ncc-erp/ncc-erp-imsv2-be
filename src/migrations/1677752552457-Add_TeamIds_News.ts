import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTeamIdsNews1677752552457 implements MigrationInterface {
  name = 'AddTeamIdsNews1677752552457';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "news_relation" ("id" SERIAL NOT NULL, "firstNewsId" integer, "secondNewsId" integer, CONSTRAINT "PK_e907859966b0fa4e440e7498da4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "news" ADD "teamIds" integer array NOT NULL DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "news_relation" ADD CONSTRAINT "FK_e72619985597089bca10b033346" FOREIGN KEY ("firstNewsId") REFERENCES "news"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "news_relation" ADD CONSTRAINT "FK_79c8befc11117e77a1bc5954eeb" FOREIGN KEY ("secondNewsId") REFERENCES "news"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "news_relation" DROP CONSTRAINT "FK_79c8befc11117e77a1bc5954eeb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "news_relation" DROP CONSTRAINT "FK_e72619985597089bca10b033346"`,
    );
    await queryRunner.query(`ALTER TABLE "news" DROP COLUMN "teamIds"`);
    await queryRunner.query(`DROP TABLE "news_relation"`);
  }
}
