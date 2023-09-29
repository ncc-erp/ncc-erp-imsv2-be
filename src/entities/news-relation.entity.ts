import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AutoIncrementEntity } from './base/auto-increment.entity';
import { News } from './news.entity';

@Entity()
export class NewsRelation extends AutoIncrementEntity {
  @ManyToOne(() => News, (news) => news.firstRelationNews, {
    cascade: true,
  })
  @JoinColumn({ name: 'firstNewsId' })
  firstNews: News;

  @ManyToOne(() => News, (news) => news.secondRelationNews, {
    cascade: true,
  })
  @JoinColumn({ name: 'secondNewsId' })
  secondNews: News;
}
