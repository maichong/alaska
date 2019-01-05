import { RecordId, Model } from 'alaska-model';

declare class OrderLog extends Model { }
interface OrderLog extends OrderLogFields { }

export interface OrderLogFields {
  title: string;
  order: RecordId;
  state: number;
  createdAt: Date;
}

export default OrderLog;
