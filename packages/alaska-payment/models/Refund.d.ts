import { RecordId, Model } from 'alaska-model';

declare class Refund extends Model {
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
