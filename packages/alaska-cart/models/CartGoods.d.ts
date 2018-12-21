import { RecordID, Model } from 'alaska-model';
import { Image } from 'alaska-field-image';

export default class CartGoods extends Model {
  pic: Image;
  title: string;
  goods: RecordID;
  sku: RecordID;
  skuDesc: string;
  user: RecordID;
  currency: string;
  price: number;
  discount: number;
  quantity: number;
  createdAt: Date;
}
