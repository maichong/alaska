import { RecordId, Model } from 'alaska-model';

declare class Payment extends Model { }
interface Payment extends PaymentFields { }

export interface PaymentFields {
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
