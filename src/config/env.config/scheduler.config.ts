import { registerAs } from '@nestjs/config';
import { SchedulerEnv, SchedulerName } from '@type/hrm/scheduler-env.type';
import { SCHEDULER_TOKEN } from '@common/constants/token.constant';

const configObj: SchedulerEnv = {};

for (const name in SchedulerName) {
  configObj[name as SchedulerName] = {
    name: process.env[`${name}_SCHEDULER_NAME`],
    isActive: process.env[`${name}_SCHEDULER_ACTIVE`] === 'true',
    cron: process.env[`${name}_SCHEDULER_CRON`],
    remainWeek: +process.env[`${name}_SCHEDULER_REMAIN_WEEK`],
    numberRecordPerFile:
      +process.env[`${name}_SCHEDULER_NUMBER_RECORD_PER_FILE`],
  };
}

export default registerAs(SCHEDULER_TOKEN, () => configObj);
