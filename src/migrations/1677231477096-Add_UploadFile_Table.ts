import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUploadFileTable1677231477096 implements MigrationInterface {
  name = 'AddUploadFileTable1677231477096';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "upload_file"
       (
         "id"  SERIAL            NOT NULL,
         "url" character varying NOT NULL,
         "key" character varying NOT NULL,
         CONSTRAINT "PK_17afec80fc97979415eae19aee0" PRIMARY KEY ("id")
       )`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."role_permission_mission_enum" RENAME TO "role_permission_mission_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."role_permission_mission_enum" AS ENUM('cms', 'album', 'authorization', 'timesheet', 'hrm', 'comment', 'like', 'widget', 'setting', 'upload_file')`,
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
      `CREATE TYPE "public"."role_permission_mission_enum_old" AS ENUM('cms', 'album', 'authorization', 'timesheet', 'hrm', 'comment', 'like', 'widget', 'setting')`,
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
    await queryRunner.query(`DROP TABLE "upload_file"`);
  }
}
