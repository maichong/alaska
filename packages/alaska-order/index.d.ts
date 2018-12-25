import { Service } from 'alaska';
import { ActionSledParams } from 'alaska-admin';
import { RecordId } from 'alaska-model';
import User from 'alaska-user/models/User';
import Address from 'alaska-address/models/Address';
import Order from './models/Order';
import OrderGoods from './models/OrderGoods';
import OrderLog from './models/OrderLog';
import Create from './sleds/Create';
import Pay from './sleds/Pay';
import Confirm from './sleds/Confirm';
import Ship from './sleds/Ship';
import Receive from './sleds/Receive';
import Reject from './sleds/Reject';
import Cancel from './sleds/Cancel';
import Delete from './sleds/Delete';
import Refund from './sleds/Refund';
import RefundReject from './sleds/RefundReject';
import RefundAccept from './sleds/RefundAccept';

declare module 'alaska-payment/models/Payment' {
  export interface PaymentFields {
    orders: Order[];
  }
}

export class OrderService extends Service {
  models: {
    Order: typeof Order;
    OrderGoods: typeof OrderGoods;
    OrderLog: typeof OrderLog;
  };
  sleds: {
    Create: typeof Create;
    Pay: typeof Pay;
    Confirm: typeof Confirm;
    Ship: typeof Ship;
    Receive: typeof Receive;
    Reject: typeof Reject;
    Cancel: typeof Cancel;
    Delete: typeof Delete;
    Refund: typeof Refund;
    RefundReject: typeof RefundReject;
    RefundAccept: typeof RefundAccept;
  };

  /**
   * 检查支付超时Interval Timer
   */
  checkPayTimer: NodeJS.Timer;
  /**
   * 检查收货超时Interval Timer
   */
  checkReceiveTimer: NodeJS.Timer;
  /**
   * 检查退款超时Interval Timer
   */
  checkRefundTimer: NodeJS.Timer;
}

declare const orderService: OrderService;

export default orderService;

export type Create = Create;
export type Pay = Pay;
export type Confirm = Confirm;
export type Ship = Ship;
export type Receive = Receive;
export type Reject = Reject;
export type Cancel = Cancel;
export type Delete = Delete;
export type Refund = Refund;
export type RefundReject = RefundReject;
export type RefundAccept = RefundAccept;

/**
 * 下单参数
 */
export interface CreateParams {
  /**
   * 是否是预下单
   */
  pre: boolean;
  user: User;
  address?: Address;
  record?: Order;
  records?: Order[];
}

/**
 * 用户支付参数
 */
export interface PayParams {
  record?: Order;
  records?: Order[];
}

/**
 * 确认订单参数
 */
export interface ConfirmParams {
  record?: Order;
  records?: Order[];
}

/**
 * 发货参数
 */
export interface ShipParams {
  record?: Order;
  records?: Order[];
}

/**
 * 确认收货参数
 */
export interface ReceiveParams {
  record?: Order;
  records?: Order[];
  /**
   * 是否是因为收货超时
   */
  timeout?: boolean;
}

/**
 * 拒绝订单参数
 */
export interface RejectParams {
  record?: Order;
  records?: Order[];
}

/**
 * 取消订单参数
 */
export interface CancelParams {
  record?: Order;
  records?: Order[];
}

/**
 * 删除订单参数
 */
export interface DeleteParams {
  record?: Order;
  records?: Order[];
  admin?: User;
}

/**
 * 支付超时
 */
export interface TimeoutParams {
  record?: Order;
  records?: Order[];
}

/**
 * 申请退款参数
 */
export interface RefundParams {
  record?: Order;
  orderGoods?: RecordId;
  reason?: string;
  amount?: number;
  quantity?: number;
  body?: {
    refundReason?: string;
    refundAmount?: number;
    refundQuantity?: number;
  };
}

export interface RefundRejectParams {
  record?: Order;
  records?: Order[];
}

export interface RefundAcceptParams {
  record?: Order;
  records?: Order[];
  /**
   * 是否是因为审核超时
   */
  timeout?: boolean;
}
