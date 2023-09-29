import { BaseTest } from '../base/base.test';
import { WidgetDTO } from '@/features/widget/dto/widget.dto';
import { UserWidgetDTO } from '@/features/widget/dto/user-widget.dto';

export class WidgetsTest extends BaseTest {
  constructor() {
    super();
  }
}
describe('Widget', () => {
  const URI = '/widgets';
  let test: WidgetsTest;
  let accessToken: string;

  beforeAll(async () => {
    test = await new WidgetsTest().init();
    accessToken = await test.login(test.admin.emailAddress);
  });

  beforeEach(async () => {
    await test.post(URI + '/my-dashboard', accessToken).send([
      {
        posX: 0,
        posY: 2,
        width: 2,
        height: 3,
        widgetCode: 2,
        title: 'Latest News',
        maxHeight: 4,
        maxWidth: 4,
        widgetId: 2,
      },
    ]);
  });

  afterAll(async () => {
    await test.destroy();
  });

  it('should get list widgets', async () => {
    const response = await test.get(URI, accessToken).expect(200);
    const widgetList = response.body as WidgetDTO[];
    expect(widgetList).toBeDefined();
  });

  it('should update widget information succesfully', async () => {
    const widgetTestUpdate: WidgetDTO = (
      await test.get(URI + '/list', accessToken).expect(200)
    ).body[0];
    const expectUpdate: any = {
      ...widgetTestUpdate,
      description: 'Test Update widget',
      thumbnailImageFile: undefined,
      entityTypeId: 0,
    };
    const response = await test
      .put(URI, accessToken)
      .send(expectUpdate)
      .expect(200);
    expect(response.body.status).toBe(202);
    const widgetListCheckAgain: WidgetDTO = (
      await test.get(URI + '/list', accessToken).expect(200)
    ).body[0];
    expect(widgetListCheckAgain.description).toBe('Test Update widget');
  });

  it('should get list widget on dashboard', async () => {
    const response = await test
      .get(URI + '/my-dashboard', accessToken)
      .expect(200);
    const widget: UserWidgetDTO[] = response.body;
    expect(widget.length).toBe(1);
  });

  it('should change widget on dashboard', async () => {
    const widgetTestId = 10;
    const widgetList = (await test.get(URI, accessToken).expect(200))
      .body as WidgetDTO[];
    const widgetAddDashboardTest = widgetList.find(
      (el) => el.id === widgetTestId,
    );
    await test
      .post(URI + '/my-dashboard', accessToken)
      .send([
        {
          posX: 0,
          posY: 0,
          width: widgetAddDashboardTest.defaultWidth,
          height: widgetAddDashboardTest.defaultWidth,
          widgetCode: widgetAddDashboardTest.id,
          title: widgetAddDashboardTest.title,
          maxHeight: widgetAddDashboardTest.maxHeight,
          maxWidth: widgetAddDashboardTest.maxWidth,
          widgetId: widgetAddDashboardTest.id,
        },
      ])
      .expect(201);
    const myDashBoard = (
      await test.get(URI + '/my-dashboard', accessToken).expect(200)
    ).body;
    expect(myDashBoard).toBeDefined();
  });

  it('should update enable/disable widget', async () => {
    let widgetTest: WidgetDTO[];
    widgetTest = (await test.get(URI + '/list', accessToken).expect(200)).body;
    const widgetTestEnable = widgetTest.filter((el) => el.isEnabled)[0];
    await test
      .get(URI + `/${widgetTestEnable.id}/disable`, accessToken)
      .expect(200);
    widgetTest = (await test.get(URI + '/list', accessToken).expect(200)).body;
    const widgetTestDisable = widgetTest.filter((el) => !el.isEnabled)[0];
    await test
      .get(URI + `/${widgetTestDisable.id}/enable`, accessToken)
      .expect(200);
  });
});
