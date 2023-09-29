import { LoggerService } from '@/logger/logger.service';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Imsv1Service } from './imsv1.service';
import { ConfigService } from '@nestjs/config';
import { SEED_DATA_TOKEN } from '@common/constants/token.constant';
import { SeedDataEnv } from '@type/seed-data.type';

@Injectable()
export class ImsV1MigrateService implements OnModuleInit {
  constructor(
    private readonly imsv1Service: Imsv1Service,
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(ImsV1MigrateService.name);
  }

  async onModuleInit() {
    if (
      this.configService.get<SeedDataEnv>(SEED_DATA_TOKEN)
        .isSeedDataFromV1Active
    ) {
      const merged = await this.imsv1Service.mergeDataFromV1();
      this.logger.info('Migrate data from V1 successfully!', merged);
    }
  }
}
