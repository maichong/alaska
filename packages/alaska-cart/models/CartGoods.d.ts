import { RecordId, Model } from 'alaska-model';
import { Image } from 'alaska-field-image';

declare class CartGoods extends Model {
  pic: Image;
  title: string;
  goods: RecordId;
  sku: RecordId;
  skuDesc: string;
  user: RecordId;
  currency: string;
  price: number;
  discount: number;
  quantity: number;
  createdAt: Date;
}

export default CartGoods;
