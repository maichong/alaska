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
  /**
   * 订单已退款金额，总额
   */
  refundedAmount: number;
  /**
   * 客户已经退货的商品总数量
   */
  refundedQuantity: number;
  refundReason: string;
  refundAmount: number;
  refundQuantity: number;
  createdAt: Date;
}
