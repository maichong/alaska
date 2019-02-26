import { Model, RecordId } from 'alaska-model';

declare class Commission extends Model { }
interface Commission extends CommissionFields { }

export interface CommissionFields {
  title: string;
  user: RecordId;
  contributor: RecordId;
  order: RecordId;
  main: RecordId;
  level: number;
  currency: string;
  amount: number;
  state: 'pending' | 'balanced' | 'failed';
  failure: string;
  createdAt: Date;
  balancedAt: Date;
}

export default Commission;
