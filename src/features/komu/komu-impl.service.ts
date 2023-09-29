import { Inject, Injectable } from '@nestjs/common';
import { HostName } from '@/client/type/client-env.type';
import { ClientService } from '@/client/client.service';
import { LoggerService } from '@/logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { CreateMessageKomu } from './dto/create-message.dto';
import { News } from '@entities/news.entity';
import { KomuService } from './komu.service';

@Injectable()
export class KomuServiceImpl implements KomuService {
  constructor(
    @Inject(HostName.KOMU)
    private readonly clientService: ClientService,
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(KomuServiceImpl.name);
  }

  async sendMessageNotifyNews(news: News) {
    const urlNews = `${this.configService.get<string>(
      'FE_URL',
    )}${news.entityType.entityName.toLowerCase()}/${news.id}`;
    const message = `${news.title}\n${news.sapo}\n${urlNews}`;
    await this.sendMessageToChannel(
      message,
      this.configService.get<string>('KOMU_NOTIFICATION_CHANNEL_ID'),
    );
  }

  async sendMessageToChannel(message: string, channelId: string) {
    try {
      await this.clientService.post<CreateMessageKomu, string>(
        '/sendMessageToChannel',
        {
          message,
          channelid: channelId,
        },
      );
      this.logger.info('Sent notification of news successfully', message);
    } catch (err) {
      this.logger.error(err.message);
    }
  }
}
