import { Model } from 'alaska-model';

declare class Withdraw extends Model {
  _id: string;
  title: string;
  user: string;
  currency: string;
  amount: number;
  note: string;
  createdAt: Date;
  state: number;
  reason: string;
}

export default Withdraw;
