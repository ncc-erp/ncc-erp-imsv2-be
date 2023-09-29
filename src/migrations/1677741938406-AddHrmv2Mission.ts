import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHrmv2Mission1677741938406 implements MigrationInterface {
  name = 'AddHrmv2Mission1677741938406';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."role_permission_mission_enum" RENAME TO "role_permission_mission_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."role_permission_mission_enum" AS ENUM('cms', 'album', 'authorization', 'timesheet', 'hrm', 'hrmv2', 'comment', 'like', 'widget', 'setting', 'upload_file')`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission"
        ALTER COLUMN "mission" TYPE "public"."role_permission_mission_enum" USING "mission"::"text"::"public"."role_permission_mission_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."role_permission_mission_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."role_permission_mission_enum_old" AS ENUM('cms', 'album', 'authorization', 'timesheet', 'hrm', 'comment', 'like', 'widget', 'setting', 'upload_file')`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission"
        ALTER COLUMN "mission" TYPE "public"."role_permission_mission_enum_old" USING "mission"::"text"::"public"."role_permission_mission_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."role_permission_mission_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."role_permission_mission_enum_old" RENAME TO "role_permission_mission_enum"`,
    );
  }
}
