import { RecordId, Model } from 'alaska-model';

export default class OrderGoods extends Model {
  pic: Object;
  title: string;
  order: RecordId;
  goods: RecordId;
  sku?: RecordId;
  skuDesc: string;
  skuKey: string;
  currency: string;
  price: number;
  discount: number;
  quantity: number;
  shipping: number;
  total: number;
  refund: number;
  refundReason: string;
  refundAmount: number;
  refundQuantity: number;
  createdAt: Date;
}
