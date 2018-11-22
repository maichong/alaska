import { Model } from 'alaska-model';

declare class Payment extends Model {
  _id: string;
  title: string;
  user: string;
  amount: number;
  type: string;
  params: string;
  state: number;
  failure: string;
  createdAt: Date;
}

export default Payment;
