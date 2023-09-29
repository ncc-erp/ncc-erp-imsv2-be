import { registerAs } from '@nestjs/config';
import { SEED_DATA_TOKEN } from '@common/constants/token.constant';
import * as process from 'process';
import { SeedDataEnv } from '@type/seed-data.type';

export default registerAs(
  SEED_DATA_TOKEN,
  (): SeedDataEnv => ({
    isSeedRoleActive: process.env.SEED_ROLE_ACTIVE === 'true',
    isSeedRoleAdminActive: process.env.SEED_ROLE_ADMIN_ACTIVE === 'true',
    isSeedRoleStaffActive: process.env.SEED_ROLE_STAFF_ACTIVE === 'true',
    isSeedDataFromV1Active: process.env.SEED_DATA_FROM_V1_ACTIVE === 'true',
    isSeedWidgetActive: process.env.SEED_WIDGET_ACTIVE === 'true',
  }),
);
