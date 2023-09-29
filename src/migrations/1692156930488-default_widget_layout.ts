import { MigrationInterface, QueryRunner } from 'typeorm';

export class defaultWidgetLayout1692156930488 implements MigrationInterface {
  name = 'defaultWidgetLayout1692156930488';

  public async up(queryRunner: QueryRunner): Promise<void> {
    let lastId = await queryRunner.query(
      'select id+1 as id from setting order by id desc limit 1',
    );
    if (!lastId || (Array.isArray(lastId) && lastId.length === 0)) {
      lastId = [{ id: 1 }];
    }
    await queryRunner.query(
      `insert into public.setting (id, name, value) values ($1,$2,$3)`,
      [
        lastId[0].id,
        'defaultWidgetLayout',
        '[{"posX":0,"posY":5,"width":2,"height":2,"title":"Faces","thumbnailImage":null,"url":null,"widgetCode":5,"maxHeight":4,"maxWidth":4},{"posX":0,"posY":0,"width":2,"height":1,"title":"Widget link sang các tool khác","thumbnailImage":"","url":"null","widgetCode":16,"maxHeight":4,"maxWidth":4},{"posX":0,"posY":3,"width":2,"height":1,"title":"Tổng quỹ phạt","thumbnailImage":"","url":"null","widgetCode":6,"maxHeight":4,"maxWidth":4},{"posX":0,"posY":4,"width":2,"height":1,"title":"Total Unlock Timesheet","thumbnailImage":"","url":"null","widgetCode":12,"maxHeight":4,"maxWidth":4},{"posX":5,"posY":0,"width":3,"height":3,"title":"Sự kiện","thumbnailImage":"","url":"null","widgetCode":18,"maxHeight":4,"maxWidth":4},{"posX":2,"posY":3,"width":3,"height":3,"title":"Quy định","thumbnailImage":"","url":"null","widgetCode":20,"maxHeight":4,"maxWidth":4},{"posX":5,"posY":3,"width":3,"height":3,"title":"Hướng dẫn","thumbnailImage":"","url":"null","widgetCode":19,"maxHeight":4,"maxWidth":4},{"posX":8,"posY":0,"width":3,"height":4,"title":"Tin nhanh","thumbnailImage":"","url":"null","widgetCode":3,"maxHeight":4,"maxWidth":4},{"posX":8,"posY":4,"width":3,"height":2,"title":"Traditional Albums","thumbnailImage":"","url":"null","widgetCode":13,"maxHeight":4,"maxWidth":4},{"posX":0,"posY":1,"width":2,"height":2,"title":"Check in work from home","thumbnailImage":"","url":"null","widgetCode":1,"maxHeight":4,"maxWidth":4},{"posX":2,"posY":0,"width":3,"height":3,"title":"Tin tức","thumbnailImage":"","url":"null","widgetCode":17,"maxHeight":4,"maxWidth":4}]',
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM public.setting WHERE name = $1 `, [
      'defaultWidgetLayout',
    ]);
  }
}
