import { Model } from 'alaska-model';

declare class Withdraw extends Model { }
interface Withdraw extends WithdrawFields { }

export interface WithdrawFields {
  title: string;
  user: string;
  currency: string;
  account: string;
  amount: number;
  note: string;
  createdAt: Date;
  state: 'pending' | 'accepted' | 'rejected';
  reason: string;
}

export default Withdraw;
