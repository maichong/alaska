import { RecordId, Model } from 'alaska-model';

declare class Payment extends Model {
  title: string;
  user: RecordId;
  currency: string;
  amount: number;
  type: string;
  params: any;
  state: number;
  failure: string;
  createdAt: Date;
}

export default Payment;
