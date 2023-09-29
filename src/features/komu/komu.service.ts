import { News } from '@entities/news.entity';

export interface KomuService {
  sendMessageNotifyNews(news: News): void;

  sendMessageToChannel(message: string, channelId: string): void;
}
