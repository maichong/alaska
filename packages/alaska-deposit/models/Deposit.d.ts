import * as mongodb from 'mongodb';
import { Model, RecordId } from 'alaska-model';

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
}

export default Deposit;
