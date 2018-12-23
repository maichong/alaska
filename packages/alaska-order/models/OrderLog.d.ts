import { RecordId, Model } from 'alaska-model';

export default class OrderLog extends Model {
  title: string;
  order: RecordId;
  state: number;
  createdAt: Date;
}
