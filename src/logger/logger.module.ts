import { LoggerConfig } from '@/config/winston.config';
import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { LoggerService } from './logger.service';

@Global()
@Module({
  imports: [WinstonModule.forRoot(new LoggerConfig().console())],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
