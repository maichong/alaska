import { Model } from 'alaska-model';

declare class Help extends Model {
  _id: string;
  title: string;
  parent: string;
  relations: string[];
  sort: number;
  activated: boolean;
  createdAt: Date;
  content: string;
}

export default Help;
