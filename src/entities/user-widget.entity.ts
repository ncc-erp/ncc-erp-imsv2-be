import { IsNumber, IsString } from 'class-validator';
import { Column, Entity, ManyToOne } from 'typeorm';
import { AutoIncrementEntity } from './base/auto-increment.entity';
import { User } from './user.entity';
import { Widget } from './widget.entity';

@Entity()
export class UserWidget extends AutoIncrementEntity {
  @ManyToOne(() => User, (u) => u.userWidgets, { nullable: false })
  user: User;

  @ManyToOne(() => Widget, (w) => w.userWidgets, { nullable: false })
  widget: Widget;

  @Column({ nullable: true })
  @IsString()
  title?: string;

  @Column({ default: 1 })
  @IsNumber()
  height: number;

  @Column({ default: 1 })
  @IsNumber()
  width: number;

  @Column({ default: 0 })
  @IsNumber()
  posX: number;

  @Column({ default: 0 })
  @IsNumber()
  posY: number;
}
