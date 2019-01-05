import { Model } from 'alaska-model';

declare class Help extends Model { }
interface Help extends HelpFields { }

export interface HelpFields {
  title: string;
  parent: string;
  relations: string[];
  sort: number;
  activated: boolean;
  createdAt: Date;
  content: string;
}

export default Help;
