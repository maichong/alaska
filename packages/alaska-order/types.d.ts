import { Address } from 'alaska-address/types';

export interface Order {
  id: string;
  code: string;
  title: string;
  user: string;
  type: string;
  pic: string;
  goods: string[];
  address: Address;
  currency: string;
  shipping: number;
  total: number;
  pay: number;
  payed: number;
  deduction: number;
  deductionCurrency: string;
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
  createdAt: string;
  paymentTimeout: string;
  receiveTimeout: string;
  refundTimeout: string;
  commented: boolean;
}


export interface OrderGoods {
  id: string;
  pic: string;
  title: string;
  order: string;
  goods: string;
  sku?: string;
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
  comment: string;
  createdAt: string;
}


export interface OrderLog {
  id: string;
  title: string;
  order: string;
  state: number;
  createdAt: string;
}
