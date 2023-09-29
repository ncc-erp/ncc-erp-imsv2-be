import { HttpModule } from '@nestjs/axios';
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import clientConfig from '@/config/env.config/client.config';
import { ClientService } from './client.service';
import { ClientOptions } from './type/client-options.interface';
import { HttpConfigFactory } from './http-config.factory';
import { ClientEnv } from './type/client-env.type';

@Module({})
export class ClientModule {
  static register(options: ClientOptions): DynamicModule {
    return {
      module: ClientModule,
      imports: [
        HttpModule.registerAsync({
          imports: [ConfigModule.forFeature(clientConfig)],
          useFactory: (configService: ConfigService) => {
            const clConfig: ClientEnv = configService.get('client');
            return HttpConfigFactory(options, clConfig);
          },
          inject: [ConfigService],
        }),
      ],
      providers: [
        {
          provide: options.hostName,
          useClass: ClientService,
        },
      ],
      exports: [options.hostName],
    };
  }
}
