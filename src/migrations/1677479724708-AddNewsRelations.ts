import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewsRelations1677479724708 implements MigrationInterface {
  name = 'AddNewsRelations1677479724708';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "news"
        ADD CONSTRAINT "FK_c2f58b358eeb29f9771aadcb33f" FOREIGN KEY ("entityTypeId") REFERENCES "entity_type" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "news"
        DROP CONSTRAINT "FK_c2f58b358eeb29f9771aadcb33f"`,
    );
  }
}
