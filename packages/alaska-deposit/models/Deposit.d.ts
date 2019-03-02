import * as mongodb from 'mongodb';
import { Model, RecordId } from 'alaska-model';
import Income from 'alaska-balance/models/Income';

declare class Deposit extends Model { }
interface Deposit extends DepositFields { }

export interface DepositFields {
  title: string;
  user: RecordId;
  currency: string;
  amount: number;
  balance: number;
  createdAt: Date;
  expiredAt: Date;

  income(amount: number, title: string, type?: string, dbSession?: mongodb.ClientSession): Promise<Income>;
}

export default Deposit;
