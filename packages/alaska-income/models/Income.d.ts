import { Model, RecordId } from 'alaska-model';

declare class Income extends Model { }
interface Income extends IncomeFields { }

export interface IncomeFields {
  title: string;
  user: RecordId;
  type: string;
  target: string;
  currency: string;
  account: string;
  deposit: string;
  amount: number;
  balance: number;
  createdAt: Date;
}

export default Income;
