import { FilesService } from '@/features/files/files.service';
import { StatusType } from '@/types/status.enum';
import { ClsService } from 'nestjs-cls';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  RemoveEvent,
  UpdateEvent,
} from 'typeorm';
import { News } from '../news.entity';

@EventSubscriber()
export class NewsSubscriber implements EntitySubscriberInterface<News> {
  constructor(
    datasource: DataSource,
    private readonly cls: ClsService,
    private readonly filesService: FilesService,
  ) {
    datasource.subscribers.push(this);
  }

  listenTo() {
    return News;
  }

  beforeUpdate(event: UpdateEvent<News>) {
    const news = event.entity;
    const userId = this.cls.get('user').id;
    if (news.status === StatusType.Approved && !news.publishedTime) {
      news.publishedTime = new Date();
      news.publishedBy = userId;
    }
  }

  beforeRemove(event: RemoveEvent<News>) {
    if (!event.entity) return;
    const news = event.entity;
    return Promise.all([
      this.filesService.deleteFile(news.coverImage ?? '').catch(() => null),
      this.filesService.deleteFile(news.thumbnailImage ?? '').catch(() => null),
    ]);
  }
}
