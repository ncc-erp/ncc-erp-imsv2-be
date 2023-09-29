import { MigrationInterface, QueryRunner } from 'typeorm';

export class addMission1677141309264 implements MigrationInterface {
  name = 'addMission1677141309264';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."role_permission_actions_enum" RENAME TO "role_permission_actions_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."role_permission_actions_enum" AS ENUM('create', 'read', 'delete', 'update', 'manage')`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission" ALTER COLUMN "actions" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission" ALTER COLUMN "actions" TYPE "public"."role_permission_actions_enum"[] USING "actions"::"text"::"public"."role_permission_actions_enum"[]`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission" ALTER COLUMN "actions" SET DEFAULT '{read}'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."role_permission_actions_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."role_permission_mission_enum" RENAME TO "role_permission_mission_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."role_permission_mission_enum" AS ENUM('cms', 'album', 'authorization', 'timesheet', 'hrm', 'comment', 'like', 'widget')`,
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
      `CREATE TYPE "public"."role_permission_mission_enum_old" AS ENUM('cms', 'album', 'authorization', 'timesheet', 'hrm')`,
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
    await queryRunner.query(
      `CREATE TYPE "public"."role_permission_actions_enum_old" AS ENUM('create', 'read', 'delete', 'update')`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission" ALTER COLUMN "actions" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission" ALTER COLUMN "actions" TYPE "public"."role_permission_actions_enum_old"[] USING "actions"::"text"::"public"."role_permission_actions_enum_old"[]`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permission" ALTER COLUMN "actions" SET DEFAULT '{read}'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."role_permission_actions_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."role_permission_actions_enum_old" RENAME TO "role_permission_actions_enum"`,
    );
  }
}
