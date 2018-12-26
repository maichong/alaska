import { Service } from 'alaska';
import { RecordId } from 'alaska-model';
import CartGoods from './models/CartGoods';

export class CartService extends Service {
  models: {
    CartGoods: typeof CartGoods;
  };
}

declare const cartService: CartService;

export default cartService;

export interface CreateParams {
  user: RecordId;
  goods: RecordId;
  // 是否更新数量，默认累加数量
  replaceQuantity?: boolean;
  sku?: RecordId;
  quantity?: number;
}
