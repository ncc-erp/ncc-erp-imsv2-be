import { MigrationInterface, QueryRunner } from 'typeorm';

export class addColumnActiveOnAlbum1688704699615 implements MigrationInterface {
  name = 'addColumnActiveOnAlbum1688704699615';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "traditional_albums"
      ADD "isActive" boolean NOT NULL DEFAULT true`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "traditional_albums"
      DROP COLUMN "isActive"`);
  }
}
