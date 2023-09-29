import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrationComment1678446421076 implements MigrationInterface {
  name = 'MigrationComment1678446421076';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comment"
        ADD CONSTRAINT "FK_73aac6035a70c5f0313c939f237" FOREIGN KEY ("parentCommentId") REFERENCES "comment" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment"
        ADD CONSTRAINT "FK_447dfbb1cb1ca1176d780ee6f16" FOREIGN KEY ("createdBy") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "traditional_albums" ADD CONSTRAINT "FK_05ca052d6c46f1be75a011f1b3b" FOREIGN KEY ("entityTypeId") REFERENCES "entity_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "traditional_albums" DROP CONSTRAINT "FK_05ca052d6c46f1be75a011f1b3b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment"
        DROP CONSTRAINT "FK_447dfbb1cb1ca1176d780ee6f16"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment"
        DROP CONSTRAINT "FK_73aac6035a70c5f0313c939f237"`,
    );
  }
}
