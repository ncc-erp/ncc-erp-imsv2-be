import { IFilterItem } from './id-label-filter.interface';

export enum EntityName {
  News = 'News',
  Events = 'Events',
  Guidelines = 'Guidelines',
  Policies = 'Policies',
  Widgets = 'Widgets',
  TraditionAlbums = 'TraditionAlbums',
}

export enum LikeableEntity {
  News = 'News',
  Comments = 'Comments',
}

export const NewsCategories: IFilterItem[] = [
  {
    id: EntityName.News,
    label: 'News',
  },
  {
    id: EntityName.Events,
    label: 'Events',
  },
  {
    id: EntityName.Guidelines,
    label: 'Guidelines',
  },
  {
    id: EntityName.Policies,
    label: 'Policies',
  },
];
