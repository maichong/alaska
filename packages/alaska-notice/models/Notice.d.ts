import { Model } from 'alaska-model';

declare class Notice extends Model { }
interface Notice extends NoticeFields { }

export interface NoticeFields {
  title: string;
  top: boolean;
  createdAt: Date;
  content: string;
}

export default Notice;
