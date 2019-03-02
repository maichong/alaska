import { RecordId, Model } from 'alaska-model';
import { Image } from 'alaska-field-image';

declare class OrderGoods extends Model { }
interface OrderGoods extends OrderGoodsFields { }

export interface OrderGoodsFields {
  pic: Image;
  title: string;
  order: RecordId;
  goods: RecordId;
  sku?: RecordId;
  skuDesc: string;
  skuKey: string;
  state: number;
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
  /**
   * 当前申请退款原因
   */
  refundReason: string;
  /**
   * 当前申请退款金额
   */
  refundAmount: number;
  /**
   * 当前申请退货数量
   */
  refundQuantity: number;
  /**
   * 上一次审核通过的退款金额
   */
  lastRefundAmount: number;
  /**
   * 上一次审核通过的退货数量
   */
  lastRefundQuantity: number;
  createdAt: Date;
}

export default OrderGoods;
