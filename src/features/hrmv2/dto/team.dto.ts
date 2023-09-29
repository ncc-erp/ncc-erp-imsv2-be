export interface ITeam {
  id: number;
  name: string;
}

export class TeamDTO {
  id: number;
  name: string;

  constructor(res: ITeam) {
    this.id = res.id;
    this.name = res.name;
  }
}
