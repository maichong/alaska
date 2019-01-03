import { RecordId, Model } from 'alaska-model';

declare class OrderLog extends Model {
  title: string;
  order: RecordId;
  state: number;
  createdAt: Date;
}

export default OrderLog;
