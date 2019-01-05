import { Model } from 'alaska-model';
import Income from './Income';

declare class Deposit extends Model { }
interface Deposit extends DepositFields { }

export interface DepositFields {
  title: string;
  user: string;
  currency: string;
  amount: number;
  balance: number;
  createdAt: Date;
  expiredAt: Date;

  income(amount: number, title: string, type?: string): Promise<Income>;
}

export default Deposit;
