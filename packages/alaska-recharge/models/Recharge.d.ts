import { Model, RecordId } from 'alaska-model';

declare class Recharge extends Model { }
interface Recharge extends RechargeFields { }

export interface RechargeFields {
  title: string;
  user: RecordId;
  target: 'balance' | 'deposit';
  currency: string;
  deposit: RecordId;
  amount: number;
  type: string;
  payment: RecordId;
  state: 'pending' | 'success' | 'failed';
  createdAt: Date;
}

export default Recharge;
