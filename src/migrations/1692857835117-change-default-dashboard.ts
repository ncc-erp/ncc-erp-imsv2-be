import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeDefaultDashboard1692857835117 implements MigrationInterface {
  name = 'changeDefaultDashboard1692857835117';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'UPDATE public.setting SET value = $1 where name = $2',
      [
        '[{"posX":0,"posY":3,"width":2,"height":2,"title":"Check in work from home","thumbnailImage":null,"url":null,"widgetCode":1,"maxHeight":4,"maxWidth":4},{"posX":8,"posY":0,"width":3,"height":4,"title":"Tin nhanh","thumbnailImage":null,"url":null,"widgetCode":3,"maxHeight":4,"maxWidth":4},{"posX":0,"posY":5,"width":2,"height":2,"title":"Faces","thumbnailImage":null,"url":null,"widgetCode":5,"maxHeight":4,"maxWidth":4},{"posX":0,"posY":1,"width":2,"height":1,"title":"Tổng quỹ phạt","thumbnailImage":null,"url":null,"widgetCode":6,"maxHeight":4,"maxWidth":4},{"posX":0,"posY":2,"width":2,"height":1,"title":"Total Unlock Timesheet","thumbnailImage":null,"url":null,"widgetCode":12,"maxHeight":4,"maxWidth":4},{"posX":8,"posY":4,"width":3,"height":2,"title":"Traditional Albums","thumbnailImage":null,"url":null,"widgetCode":13,"maxHeight":4,"maxWidth":4},{"posX":0,"posY":0,"width":2,"height":1,"title":"Widget link sang các tool khác","thumbnailImage":null,"url":null,"widgetCode":16,"maxHeight":4,"maxWidth":4},{"posX":2,"posY":0,"width":3,"height":3,"title":"Tin tức","thumbnailImage":null,"url":null,"widgetCode":17,"maxHeight":4,"maxWidth":4},{"posX":5,"posY":0,"width":3,"height":3,"title":"Sự kiện","thumbnailImage":null,"url":null,"widgetCode":18,"maxHeight":4,"maxWidth":4},{"posX":5,"posY":3,"width":3,"height":3,"title":"Hướng dẫn","thumbnailImage":null,"url":null,"widgetCode":19,"maxHeight":4,"maxWidth":4},{"posX":2,"posY":3,"width":3,"height":3,"title":"Quy định","thumbnailImage":null,"url":null,"widgetCode":20,"maxHeight":4,"maxWidth":4}]',
        'defaultWidgetLayout',
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM public.setting WHERE name = $1 `, [
      'defaultWidgetLayout',
    ]);
  }
}
