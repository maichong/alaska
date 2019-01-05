import { RecordId, Model } from 'alaska-model';

declare class Refund extends Model { }
interface Refund extends RefundFields { }

export interface RefundFields {
  title: string;
  user: RecordId;
  payment: RecordId;
  currency: string;
  amount: number;
  type: string;
  state: number;
  failure: string;
  createdAt: Date;
}

export default Refund;
