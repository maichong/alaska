import { RecordId, Model } from 'alaska-model';
import { Context } from 'alaska-http';
import OrderGoods from './OrderGoods';

declare class Order extends Model {
  code: string;
  title: string;
  user: RecordId;
  type: any;
  pic: Object;
  goods: RecordId[];
  address: Object;
  currency: string;
  shipping: number;
  total: number;
  pay: number;
  payed: number;
  payment: string;
  /**
   * 订单已退款金额，总额
   */
  refundedAmount: number;
  /**
   * 客户已经退货的商品总数量
   */
  refundedQuantity: number;
  /**
   * 客户申请退款的原因
   */
  refundReason: string;
  /**
   * 客户申请退款的总金额
   * 如果退款审核通过，该值会重置为0
   */
  refundAmount: number;
  /**
   * 客户申请退货的总数量
   * 如果退款审核通过，该值会重置为0
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
  shipped: boolean;
  state: number;
  failure: string;
  createdAt: Date;
  paymentTimeout: Date;
  receiveTimeout: Date;
  refundTimeout: Date;
  userDeleted: boolean;
  adminDeleted: boolean;

  canAppendGoods(goods: OrderGoods): boolean;
}

export default Order;
