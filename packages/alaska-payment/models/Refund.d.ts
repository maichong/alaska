import { RecordId, Model } from 'alaska-model';

export default class Refund extends Model {
  title: string;
  user: RecordId;
  payment: RecordId;
  currency: string;
  amount: number;
  type: string;
  state: number;
  failure: string;
  createdAt: Date;
}
