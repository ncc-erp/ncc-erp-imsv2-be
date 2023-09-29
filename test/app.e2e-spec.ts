import { BaseTest } from './base/base.test';

export class AppTest extends BaseTest {
  constructor() {
    super();
  }
}

describe('Sample test', () => {
  let base: AppTest;
  let accessToken: string;

  beforeAll(async () => {
    base = await new AppTest().init();
    accessToken = await base.login(base.staff.emailAddress);
  });

  afterAll(async () => {
    await base.destroy();
  });

  it('Sample get', async () => {
    const response = await base.get('/', accessToken);
    expect(response.status).toEqual(404);
  });
});
