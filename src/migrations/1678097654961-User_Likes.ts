import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserLikes1678097654961 implements MigrationInterface {
  name = 'UserLikes1678097654961';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_like"
      DROP COLUMN "entityName"`);
    await queryRunner.query(
      `CREATE TYPE "public"."user_like_entityname_enum" AS ENUM('News', 'Comments')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_like"
        ADD "entityName" "public"."user_like_entityname_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_like" ADD CONSTRAINT "FK_cf2ee7fd77d84d8ae1bfdb3b8db" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_like" DROP CONSTRAINT "FK_cf2ee7fd77d84d8ae1bfdb3b8db"`,
    );
    await queryRunner.query(`ALTER TABLE "user_like"
      DROP COLUMN "entityName"`);
    await queryRunner.query(`DROP TYPE "public"."user_like_entityname_enum"`);
    await queryRunner.query(
      `ALTER TABLE "user_like"
        ADD "entityName" character varying NOT NULL`,
    );
  }
}
