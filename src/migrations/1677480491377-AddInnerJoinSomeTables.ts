import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInnerJoinSomeTables1677480491377 implements MigrationInterface {
  name = 'AddInnerJoinSomeTables1677480491377';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_widget"
        DROP CONSTRAINT "FK_88c8316182b0d3a6a00958f5415"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_widget"
        DROP CONSTRAINT "FK_a89146bdcb0e8c28620feff8632"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_widget"
        ALTER COLUMN "userId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_widget"
        ALTER COLUMN "widgetId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission"
        DROP CONSTRAINT "FK_e3130a39c1e4a740d044e685730"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission"
        ALTER COLUMN "roleId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_widget"
        ADD CONSTRAINT "FK_88c8316182b0d3a6a00958f5415" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_widget"
        ADD CONSTRAINT "FK_a89146bdcb0e8c28620feff8632" FOREIGN KEY ("widgetId") REFERENCES "widget" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission"
        ADD CONSTRAINT "FK_e3130a39c1e4a740d044e685730" FOREIGN KEY ("roleId") REFERENCES "role" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "role_permission"
        DROP CONSTRAINT "FK_e3130a39c1e4a740d044e685730"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_widget"
        DROP CONSTRAINT "FK_a89146bdcb0e8c28620feff8632"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_widget"
        DROP CONSTRAINT "FK_88c8316182b0d3a6a00958f5415"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission"
        ALTER COLUMN "roleId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission"
        ADD CONSTRAINT "FK_e3130a39c1e4a740d044e685730" FOREIGN KEY ("roleId") REFERENCES "role" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_widget"
        ALTER COLUMN "widgetId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_widget"
        ALTER COLUMN "userId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_widget"
        ADD CONSTRAINT "FK_a89146bdcb0e8c28620feff8632" FOREIGN KEY ("widgetId") REFERENCES "widget" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_widget"
        ADD CONSTRAINT "FK_88c8316182b0d3a6a00958f5415" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
