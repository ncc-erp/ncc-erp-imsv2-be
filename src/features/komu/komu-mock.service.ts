import { LoggerService } from '@/logger/logger.service';
import { News } from '@entities/news.entity';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KomuService } from './komu.service';

@Injectable()
export class KomuServiceMock implements KomuService {
  constructor(
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(KomuServiceMock.name);
  }

  async sendMessageNotifyNews(news: News) {
    const message = `${news.title} \n ${
      news.sapo
    } \n ${this.configService.get<string>('FE_URL')}${news.id}`;
    await this.sendMessageToChannel(
      message,
      this.configService.get<string>('KOMU_NOTIFICATION_CHANNEL_ID'),
    );
  }

  async sendMessageToChannel(message: string, channelId: string) {
    this.logger.info('Sent message successfully', {
      message,
      channelId,
    });
  }
}
