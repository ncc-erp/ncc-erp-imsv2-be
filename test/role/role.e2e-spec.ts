import { BaseTest } from '../base/base.test';
import { RoleName } from '@type/authorization/role.enum';
import { Role } from '@entities/role.entity';
import { ClientRolePermission } from '@type/authorization/client-role-permission.interface';
import { Mission } from '@type/authorization/mission.enum';
import { Action } from '@type/authorization/action.enum';
import { constructClientFormatObj } from '@/mapping/rolePermissions.mapping';
import { UpdatePermissionsDTO } from '@features/role/dto/update-permissions.dto';

export class RoleTest extends BaseTest {
  constructor() {
    super();
  }
}

describe('Role', () => {
  const URI = '/roles';
  let test: RoleTest;
  let accessToken: string;

  beforeAll(async () => {
    test = await new RoleTest().init();
    accessToken = await test.login(test.admin.emailAddress);
  });

  afterAll(async () => {
    await test.destroy();
  });

  it('should get list roles successfully', async () => {
    const response = await test.get(URI, accessToken).expect(200);
    const roles = response.body as Role[];
    expect(roles.length).toBe(Object.keys(RoleName).length);
    expect(roles.map((role) => role.name).sort()).toEqual(
      Object.values(RoleName).sort(),
    );
  });

  it('should get role permission successfully', async () => {
    const response = await test
      .get(`${URI}/permissions`, accessToken)
      .query(`role=${RoleName.ADMIN}`)
      .expect(200);
    const rolePermissions = response.body as ClientRolePermission;
    expect(Object.keys(rolePermissions).length).toBe(
      Object.keys(Mission).length,
    );
    expect(Object.keys(rolePermissions).sort()).toEqual(
      Object.values(Mission).sort(),
    );
    for (const rolePermission of Object.values(rolePermissions)) {
      expect(rolePermission[Action.READ]).toBe(true);
      expect(rolePermission[Action.MANAGE]).toBe(true);
    }
  });

  it('should update role permission successfully', async () => {
    const payload = {
      name: RoleName.ADMIN,
      rolePermissions: constructClientFormatObj(),
    } as UpdatePermissionsDTO;

    const response = await test
      .put(`${URI}/permissions`, accessToken)
      .send(payload)
      .expect(200);

    expect(response.body.message).toBe(`Updated ${RoleName.ADMIN}`);
  });
});
