import * as mongodb from 'mongodb';
import { RecordId, Model } from 'alaska-model';
import { Context } from 'alaska-http';
import { Image } from 'alaska-field-image';
import { Address } from 'alaska-address/types';
import OrderGoods from './OrderGoods';
import OrderLog from './OrderLog';

declare class Order extends Model {
  canAppendGoods(goods: OrderGoods): boolean;
  createLog(title: string, dbSession?: mongodb.ClientSession): OrderLog;
}
interface Order extends OrderFields { }

export interface OrderFields {
  code: string;
  title: string;
  user: RecordId;
  store: string;
  shop: RecordId;
  type: string;
  pic: Image;
  goods: RecordId[];
  address: Address;
  delivery: 'express' | 'self' | string;
  message: string;
  currency: string;
  shipping: number;
  total: number;
  pay: number;
  payed: number;
  deduction: number;
  deductionCurrency: string;
  deductionAccount: string;
  deductionAmount: number;
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
  payedAt: Date;
  receivedAt: Date;
  paymentTimeout: Date;
  receiveTimeout: Date;
  refundTimeout: Date;
  userDeleted: boolean;
  adminDeleted: boolean;
}

export default Order;
