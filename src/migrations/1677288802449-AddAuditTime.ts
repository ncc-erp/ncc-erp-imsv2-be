import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuditTime1677288802449 implements MigrationInterface {
  name = 'AddAuditTime1677288802449';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "upload_file"
        ADD "createdTime" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "upload_file"
        ADD "deletedTime" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "upload_file"
        DROP COLUMN "deletedTime"`,
    );
    await queryRunner.query(
      `ALTER TABLE "upload_file"
        DROP COLUMN "createdTime"`,
    );
  }
}
