import { MigrationInterface, QueryRunner } from 'typeorm';
import { RoleName } from '@/types/authorization/role.enum';

export class seedPermissionHrStaff1692960376310 implements MigrationInterface {
  name = 'seedPermissionHrStaff1692960376310';

  public async up(queryRunner: QueryRunner): Promise<void> {
    let roleHr = await queryRunner.query(
      'select * from public.role where name = $1',
      [RoleName.HR],
    );

    if (!roleHr || roleHr.length === 0) {
      roleHr = await queryRunner.query(
        'INSERT INTO public.role (id, name) VALUES (DEFAULT, $1) RETURNING *',
        [RoleName.HR],
      );
    }

    await queryRunner.query(
      `DELETE FROM public.role_permission WHERE "roleId" = $1`,
      [roleHr.id ?? roleHr[0].id],
    );

    await queryRunner.query(
      `insert into public.role_permission (actions, mission, "roleId")
    values  ('{read}', 'timesheet', $1),
            ('{read}', 'hrm', $1),
            ('{read}', 'hrmv2', $1),
            ('{read}', 'authorization', $1),
            ('{read,manage}', 'cms', $1),
            ('{read,manage}', 'album', $1),
            ('{read}', 'comment', $1),
            ('{read}', 'like', $1),
            ('{read}', 'widget', $1),
            ('{read}', 'setting', $1),
            ('{read,manage}', 'entity_type', $1),
            ('{read}', 'upload_file', $1),
            ('{read}', 'user', $1),
            ('{read}', 'face_id', $1),
            ('{read}', 'audit_log', $1)`,
      [roleHr.id ?? roleHr[0].id],
    );

    let roleStaff = await queryRunner.query(
      'select * from public.role where name = $1',
      [RoleName.STAFF],
    );

    if (!roleStaff || roleStaff.length === 0) {
      roleStaff = await queryRunner.query(
        'INSERT INTO public.role (id, name) VALUES (DEFAULT, $1) RETURNING *',
        [RoleName.STAFF],
      );
    }

    await queryRunner.query(
      `DELETE FROM public.role_permission WHERE "roleId" = $1`,
      [roleStaff.id ?? roleStaff[0].id],
    );

    await queryRunner.query(
      `insert into public.role_permission (actions, mission, "roleId")
    values  ('{read}', 'timesheet', $1),
            ('{read}', 'hrm', $1),
            ('{read}', 'hrmv2', $1),
            ('{read}', 'authorization', $1),
            ('{read}', 'cms', $1),
            ('{read}', 'album', $1),
            ('{read}', 'comment', $1),
            ('{read}', 'like', $1),
            ('{read}', 'widget', $1),
            ('{read}', 'setting', $1),
            ('{read}', 'entity_type', $1),
            ('{read}', 'upload_file', $1),
            ('{read}', 'user', $1),
            ('{read}', 'face_id', $1),
            ('{read}', 'audit_log', $1)`,
      [roleStaff.id ?? roleStaff[0].id],
    );

    let roleIntern = await queryRunner.query(
      'select * from public.role where name = $1',
      [RoleName.INTERN],
    );

    if (!roleIntern || roleIntern.length === 0) {
      roleIntern = await queryRunner.query(
        'INSERT INTO public.role (id, name) VALUES (DEFAULT, $1) RETURNING *',
        [RoleName.INTERN],
      );
    }

    await queryRunner.query(
      `DELETE FROM public.role_permission WHERE "roleId" = $1`,
      [roleIntern.id ?? roleIntern[0].id],
    );

    await queryRunner.query(
      `insert into public.role_permission (actions, mission, "roleId")
    values  ('{read}', 'timesheet', $1),
            ('{read}', 'hrm', $1),
            ('{read}', 'hrmv2', $1),
            ('{read}', 'authorization', $1),
            ('{read}', 'cms', $1),
            ('{read}', 'album', $1),
            ('{read}', 'comment', $1),
            ('{read}', 'like', $1),
            ('{read}', 'widget', $1),
            ('{read}', 'setting', $1),
            ('{read}', 'entity_type', $1),
            ('{read}', 'upload_file', $1),
            ('{read}', 'user', $1),
            ('{read}', 'face_id', $1),
            ('{read}', 'audit_log', $1)`,
      [roleIntern.id ?? roleIntern[0].id],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('Nothing');
  }
}
