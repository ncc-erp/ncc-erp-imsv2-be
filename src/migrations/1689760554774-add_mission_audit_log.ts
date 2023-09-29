import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissionAuditLog1689760554774 implements MigrationInterface {
  name = 'AddMissionAuditLog1689760554774';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."role_permission_mission_enum" RENAME TO "role_permission_mission_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."role_permission_mission_enum" AS ENUM('cms', 'album', 'authorization', 'timesheet', 'hrm', 'hrmv2', 'face_id', 'comment', 'like', 'widget', 'setting', 'entity_type', 'upload_file', 'user', 'audit_log')`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission" ALTER COLUMN "mission" TYPE "public"."role_permission_mission_enum" USING "mission"::"text"::"public"."role_permission_mission_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."role_permission_mission_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."role_permission_mission_enum_old" AS ENUM('cms', 'album', 'authorization', 'timesheet', 'hrm', 'hrmv2', 'face_id', 'comment', 'like', 'widget', 'setting', 'entity_type', 'upload_file', 'user')`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission" ALTER COLUMN "mission" TYPE "public"."role_permission_mission_enum_old" USING "mission"::"text"::"public"."role_permission_mission_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."role_permission_mission_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."role_permission_mission_enum_old" RENAME TO "role_permission_mission_enum"`,
    );
  }
}
