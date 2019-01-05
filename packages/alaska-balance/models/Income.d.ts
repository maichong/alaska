import { Model } from 'alaska-model';

declare class Income extends Model { }
interface Income extends IncomeFields { }

export interface IncomeFields {
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
