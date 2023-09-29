import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeColumnAlbumDescriptionIndexToNullable1689129415438
  implements MigrationInterface
{
  name = 'changeColumnAlbumDescriptionIndexToNullable1689129415438';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "traditional_albums"
      ALTER COLUMN "description" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "traditional_albums"
      ALTER COLUMN "albumIndex" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "traditional_albums"
      ALTER COLUMN "albumIndex" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "traditional_albums"
      ALTER COLUMN "description" SET NOT NULL`);
  }
}
