import { Model } from 'alaska-model';

declare class Income extends Model {
  _id: string;
  title: string;
  user: string;
  type: string;
  target: string;
  currency: string;
  deposit: string;
  amount: number;
  balance: number;
  createdAt: Date;
}

export default Income;
