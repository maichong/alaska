import { Model } from 'alaska-model';

declare class Deposit extends Model {
  _id: string;
  title: string;
  user: string;
  currency: string;
  amount: number;
  balance: number;
  createdAt: Date;
  expiredAt: Date;
}

export default Deposit;
