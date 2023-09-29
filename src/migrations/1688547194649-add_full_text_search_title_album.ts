import { MigrationInterface, QueryRunner } from 'typeorm';

export class addFullTextSearchTitleAlbum1688547194649
  implements MigrationInterface
{
  name = 'addFullTextSearchTitleAlbum1688547194649';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `alter table public.traditional_albums add column "ftsTitle" tsvector`,
    );
    await queryRunner.query(
      `update public.traditional_albums p set "ftsTitle" = to_tsvector(p.title)`,
    );

    await queryRunner.query(
      `create index albums_fts_title_idx on public.traditional_albums using gin ("ftsTitle")`,
    );
    await queryRunner.query(`CREATE OR REPLACE FUNCTION traditional_albums_update_fts_title()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW."ftsTitle" := to_tsvector(NEW.title);
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;`);
    await queryRunner.query(`CREATE TRIGGER trigger_traditional_albums_update_fts_title
       BEFORE INSERT OR UPDATE ON public.traditional_albums
       FOR EACH ROW EXECUTE FUNCTION traditional_albums_update_fts_title();`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop index if exists albums_fts_title_idx`);
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trigger_traditional_albums_update_fts_title ON public.traditional_albums;`,
    );
    await queryRunner.query(
      `alter table public.traditional_albums drop column if exists "ftsTitle"`,
    );
  }
}
