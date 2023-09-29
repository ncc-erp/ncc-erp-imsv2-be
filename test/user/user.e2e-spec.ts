import { BaseTest } from '../base/base.test';
import { User } from '@entities/user.entity';
import { RoleName } from '@type/authorization/role.enum';
import { UserProfileDTO } from '@features/user/dto/user-profile.dto';

export class UserTest extends BaseTest {
  constructor() {
    super();
  }
}

describe('User', () => {
  const URI = '/user';
  let test: UserTest;
  let accessToken: string;

  beforeAll(async () => {
    test = await new UserTest().init();
    accessToken = await test.login(test.admin.emailAddress);
  });

  afterAll(async () => {
    await test.destroy();
  });

  it('should get list user successfully', async () => {
    const response = await test
      .get(URI, accessToken)
      .query(`size=10`)
      .expect(200);
    const users = response.body.data as User[];
    expect(users.length).toBe(4);
    expect(
      users
        .find((user) => user.emailAddress === test.admin.emailAddress)
        ?.roles?.map((role) => role.name),
    ).toContain(RoleName.ADMIN);
  });

  it('should get user profile successfully', async () => {
    const response = await test.get(`${URI}/profile`, accessToken).expect(200);
    const user = response.body as UserProfileDTO;
    expect(user.emailAddress).toBe(test.admin.emailAddress);
    expect(user.roles.map((role) => role.name)).toContain(RoleName.ADMIN);
  });

  it('should get user detail successfully', async () => {
    const userId = test.admin.id;
    const response = await test
      .get(`${URI}/details/${userId}`, accessToken)
      .expect(200);
    const user = response.body as UserProfileDTO;
    expect(user.emailAddress).toBe(test.admin.emailAddress);
    expect(user.roles.map((role) => role.name)).toContain(RoleName.ADMIN);
  });

  it('should change role user successfully', async () => {
    const payload = {
      userId: test.admin.id,
      roleNames: [RoleName.ADMIN, RoleName.STAFF],
    };

    const response = await test
      .put(`${URI}/roles`, accessToken)
      .send(payload)
      .expect(200);

    const user = response.body as User;
    expect(user.roles.length).toBe(2);
    expect(user.roles.map((role) => role.name)).toContain(RoleName.STAFF);
  });
});
