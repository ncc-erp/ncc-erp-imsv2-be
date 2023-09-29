import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsActiveColEnTy1678703583031 implements MigrationInterface {
  name = 'AddIsActiveColEnTy1678703583031';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "entity_type" ADD "isActive" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "entity_type" DROP COLUMN "isActive"`);
  }
}
