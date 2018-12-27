import { Model, RecordId } from 'alaska-model';

export default class Inventory extends Model {
  title: string;
  user: RecordId;
  goods: RecordId;
  sku: RecordId;
  type: 'input' | 'output';
  quantity: number;
  inventory: number;
  createdAt: Date;
}
