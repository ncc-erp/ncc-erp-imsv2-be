import { Module } from '@nestjs/common';
import { EntityType } from '@/entities/entityType.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityTypeService } from './entity-type.service';
import { EntityTypeController } from './entity-type.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EntityType])],
  providers: [EntityTypeService],
  controllers: [EntityTypeController],
  exports: [EntityTypeService],
})
export class EntityTypeModule {}
