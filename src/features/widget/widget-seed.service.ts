import { EntityType } from '@/entities/entityType.entity';
import { Widget } from '@/entities/widget.entity';
import { LoggerService } from '@/logger/logger.service';
import { EntityName } from '@/types/entityName.enum';
import { WidgetTypes } from '@/types/widget/widget.constant';
import { generateNewId } from '@/utils/mapId';
import { EntityTypeService } from '@features/entity-type/entity-type.service';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { In } from 'typeorm';
import { WidgetService } from './widget.service';
import { ConfigService } from '@nestjs/config';
import { SEED_DATA_TOKEN } from '@common/constants/token.constant';
import { SeedDataEnv } from '@type/seed-data.type';

@Injectable()
export class WidgetSeedService implements OnModuleInit {
  constructor(
    private readonly widgetService: WidgetService,
    private readonly logger: LoggerService,
    private readonly entityService: EntityTypeService,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(WidgetSeedService.name);
  }

  async onModuleInit() {
    if (
      !this.configService.get<SeedDataEnv>(SEED_DATA_TOKEN).isSeedWidgetActive
    ) {
      this.logger.info('Seed widget data is OFF');
      return;
    }
    const newWidgets = await this.seedWidgetData();
    if (newWidgets.length) {
      this.logger.info(
        'Seed data for Widget successfully!',
        newWidgets.map((w) => w.code).join(', '),
      );
    }
  }

  async seedWidgetData() {
    let widgetType = await this.entityService.findOne(
      {
        where: { entityName: EntityName.Widgets },
      },
      true,
    );

    if (!widgetType) {
      const totalTypes = await this.entityService.findMany({});

      widgetType = new EntityType();
      widgetType.id = generateNewId(totalTypes.map((t) => t.id));
      widgetType.entityName = EntityName.Widgets;
      widgetType.displayName = 'Widget Type';
      await this.entityService.singleSave(widgetType);
    }

    const widgetCodes = WidgetTypes.map((w) => w.code);
    const existWidgets = await this.widgetService.getManyWidget({
      where: {
        code: In(widgetCodes),
      },
    });

    const insertWidgets = WidgetTypes.filter(
      (w) => !existWidgets.some((e) => e.code === w.code),
    ).map((w) => {
      const newWidget = new Widget();
      newWidget.code = w.code;
      newWidget.entityType = widgetType;
      newWidget.title = w.title;
      newWidget.description = w.description;
      newWidget.defaultHeight = w.defaultHeight;
      newWidget.defaultWidth = w.defaultWidth;
      newWidget.url = w.url;

      return newWidget;
    });

    return this.widgetService.saveManyWidget(insertWidgets);
  }
}
