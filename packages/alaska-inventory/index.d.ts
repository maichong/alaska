import { Service, Plugin } from 'alaska';
import User from 'alaska-user/models/User';
import { RecordId } from 'alaska-model';
import Inventory from './models/Inventory';
import Create from './sleds/Create';

export class InventoryService extends Service {
  models: {
    Inventory: typeof Inventory;
  };
  sleds: {
    Create: typeof Create;
  };
}

declare const inventoryService: InventoryService;

export default inventoryService;

export interface ParamsBody {
  user?: RecordId;
  type?: string;
  goods?: RecordId;
  sku?: RecordId;
  quantity: number;
  desc?: string;
}

export interface CreateParams {
  admin?: User;
  user?: User;
  body: ParamsBody;
}
