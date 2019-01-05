import { Model, RecordId } from 'alaska-model';

declare class Inventory extends Model { }
interface Inventory extends InventoryFields { }

export interface InventoryFields {
  title: string;
  user: RecordId;
  goods: RecordId;
  sku: RecordId;
  type: 'input' | 'output';
  quantity: number;
  inventory: number;
  createdAt: Date;
}

export default Inventory;
