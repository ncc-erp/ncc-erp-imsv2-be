import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuditLogTable1689749205836 implements MigrationInterface {
  name = 'AddAuditLogTable1689749205836';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "audit_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "endpoint" character varying NOT NULL, "method" character varying NOT NULL, "statusCode" integer NOT NULL, "params" text, "body" text, "executionTime" double precision NOT NULL, "createdBy" character varying NOT NULL, "createdTime" TIMESTAMP NOT NULL DEFAULT now(), "exception" text, CONSTRAINT "PK_07fefa57f7f5ab8fc3f52b3ed0b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_73c4f2f5692fe6f2a04e705687" ON "audit_log" ("createdTime") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_73c4f2f5692fe6f2a04e705687"`,
    );
    await queryRunner.query(`DROP TABLE "audit_log"`);
  }
}
