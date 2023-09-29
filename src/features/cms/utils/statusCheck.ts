import { StatusType } from '@/types/status.enum';

export const statusChangeIsValid = (src: StatusType, des: StatusType) =>
  STATUS_GRAPH[src].includes(des);

const STATUS_GRAPH: {
  [key in StatusType]: StatusType[];
} = {
  [StatusType.Draft]: [StatusType.Waiting],
  [StatusType.Waiting]: [StatusType.Draft, StatusType.Approved],
  [StatusType.Approved]: [StatusType.Hidden],
  [StatusType.Hidden]: [StatusType.Draft, StatusType.Approved],
  [StatusType.Disabled]: [],
  [StatusType.Return]: [],
};
