import { OrderingDirection } from '@/common/constants/order.constant';
import { Setting } from '@/entities/setting.entity';
import { BaseService } from '@/features/base/base.service';
import { UserWidgetDTO } from '@/features/widget/dto/user-widget.dto';
import { DEFAULT_WIDGET_LAYOUT } from '@/types/widget/widget.constant';
import {
  lowerCaseFirstLetter,
  suffixName,
  upperCaseFirstLetter,
} from '@/utils/formatSetting';
import { generateNewId } from '@/utils/mapId';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { SettingEmailDTO, SettingKomuDTO } from './dto/setting.dto';

@Injectable()
export class SettingService extends BaseService<Setting> {
  constructor(
    @InjectRepository(Setting) private settingRepository: Repository<Setting>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    super(settingRepository, Setting);
  }

  async getAllSettings() {
    return this.settingRepository.find();
  }

  async getSettings() {
    const settings = await this.getAllSettings();
    return this.printResponseSettings(settings);
  }

  async updateSetting(updateSettings: SettingEmailDTO | SettingKomuDTO) {
    const settings = await this.getAllSettings();
    const mapSettings = new Map(Object.entries(updateSettings));
    mapSettings.forEach((value, key) => {
      const settingItem = settings.find(
        (setting) => lowerCaseFirstLetter(suffixName(setting.name)) === key,
      );
      if (settingItem) {
        settingItem.value = value;
      } else {
        const id = generateNewId(settings.map((s) => s.id));
        settings.push({ id, name: upperCaseFirstLetter(key), value });
      }
    });
    const result = await this.settingRepository.save(settings);
    return this.printResponseSettings(result);
  }

  async printResponseSettings(settings: Setting[]) {
    const pureValues: { [key: string]: string } = {};
    settings.forEach((setting) => {
      pureValues[lowerCaseFirstLetter(suffixName(setting.name))] =
        setting.value;
    });
    const {
      port,
      host,
      password,
      userName,
      enableSsl,
      defaultFromAddress,
      defaultFromDisplayName,
      enableAllowCheckInIMSForAll,
      enableToNoticeKomu,
    } = pureValues;
    const emailSetting = new SettingEmailDTO({
      port,
      host,
      password,
      userName,
      enableSsl,
      defaultFromAddress,
      defaultFromDisplayName,
    });
    const komuSetting = new SettingKomuDTO({
      enableAllowCheckInIMSForAll,
      enableToNoticeKomu,
    });
    return { email: emailSetting, komu: komuSetting };
  }

  async saveDefaultWidgetLayout(myWidgets: UserWidgetDTO[]) {
    let defaultWidgetLayout = await this.findOne({
      where: {
        name: DEFAULT_WIDGET_LAYOUT,
      },
    });

    if (!defaultWidgetLayout) {
      const [lastSetting] = await this.findAll({
        take: 1,
        order: {
          id: OrderingDirection.DESC,
        },
      });
      defaultWidgetLayout = this.create({
        id: lastSetting.length === 0 ? 1 : ++lastSetting[0].id,
        name: DEFAULT_WIDGET_LAYOUT,
      });
    }

    defaultWidgetLayout.value = JSON.stringify(myWidgets);
    await this.save(defaultWidgetLayout);
    await this.cacheManager.set(DEFAULT_WIDGET_LAYOUT, myWidgets, 0);
  }

  async getDefaultWidgetLayout() {
    let defaultWidgetLayout = await this.cacheManager.get(
      DEFAULT_WIDGET_LAYOUT,
    );
    if (
      !defaultWidgetLayout ||
      (Array.isArray(defaultWidgetLayout) && defaultWidgetLayout.length === 0)
    ) {
      const defaultWidgetLayoutSetting = await this.findOne({
        where: {
          name: DEFAULT_WIDGET_LAYOUT,
        },
      });

      defaultWidgetLayout = defaultWidgetLayoutSetting
        ? JSON.parse(defaultWidgetLayoutSetting.value)
        : [];
      await this.cacheManager.set(
        DEFAULT_WIDGET_LAYOUT,
        defaultWidgetLayout,
        0,
      );
    }

    return defaultWidgetLayout;
  }
}
