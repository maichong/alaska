import { Service } from 'alaska';
import { RecordID } from 'alaska-model';
import CartGoods from './models/CartGoods';

export class CartService extends Service {
  models: {
    CartGoods: typeof CartGoods;
  };
}

declare const cartService: CartService;

export default cartService;

export interface CreateParams {
  user: RecordID;
  goods: RecordID;
  sku?: RecordID;
  quantity?: number;
}
