import { Service, Plugin } from 'alaska';
import User from 'alaska-user/models/User';
import { RecordId } from 'alaska-model';
import Inventory from './models/Inventory';
import Input from './sleds/Input';
import Output from './sleds/Output';

export class InventoryService extends Service {
  models: {
    Inventory: typeof Inventory;
  };
  sleds: {
    Input: typeof Input;
    Output: typeof Output;
  };
}

declare const inventoryService: InventoryService;

export default inventoryService;

export interface ParamsBody {
  user?: RecordId;
  goods?: RecordId;
  sku?: RecordId;
  quantity: number;
}

export interface InputParams {
  admin?: User;
  user?: User;
  body: ParamsBody;
}

export interface OutputParams {
  admin?: User;
  user?: User;
  body: ParamsBody;
}
