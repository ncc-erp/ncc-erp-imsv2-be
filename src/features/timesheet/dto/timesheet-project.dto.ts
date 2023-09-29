export class TimeSheetProjectDto {
  projectName: string;
  projectCode: string;
  projectUserType: string;
  listPM: string[];
  tasks: TaskDto[];
  id: number;
}

export class TaskDto {
  projectTaskId: number;
  taskName: string;
  billable: boolean;
  isDefault: boolean;
}
