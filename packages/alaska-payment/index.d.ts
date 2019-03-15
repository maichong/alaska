import { Service, Plugin } from 'alaska';
import User from 'alaska-user/models/User';
import Order from 'alaska-order/models/Order';
import Payment from './models/Payment';
import Refund from './models/Refund';
import Create from './sleds/Create';
import Complete from './sleds/Complete';
import RefundSled from './sleds/Refund';

export class PaymentPlugin extends Plugin {
  static readonly classOfPaymentPlugin: true;
  readonly instanceOfPaymentPlugin: true;

  /**
   * 支付插件支持的货币列表
   */
  currencies: Set<string>;

  /**
   * 创建支付参数，如果返回数字 'success'，代表支付已经完成，不需要客户端再做处理
   * @param {Payment} payment 支付记录
   */
  createParams(payment: Payment): Promise<string>;

  /**
   * 验证回调数据
   * @param data 回调数据
   */
  verify(data: any, payment: Payment): Promise<boolean>;

  /**
   * 退款
   * @param {Refund} refund 退款记录
   * @param {Payment} payment 支付记录
   */
  refund(refund: Refund, payment: Payment): Promise<void>;
}

export interface CreateParams {
  user: User;
  type: string;
  ip?: string;
  orders?: string[] | Order[];
  /**
   * 需要前置钩子中生成支付记录，不需要手动传入
   */
  payment?: Payment;
}

export interface CompleteParams {
  record: Payment;
  done?: boolean;
}

export interface RefundParams {
  payment: Payment;
  /**
   * 退款金额，用于生成 refund 记录，默认为payment总金额
   */
  amount?: number;
  /**
   * 需要前置钩子中生成退款记录，不需要手动传入
   */
  refund?: Refund;
}

export class PaymentService extends Service {
  models: {
    Payment: typeof Payment;
    Refund: typeof Refund;
  };
  sleds: {
    Create: typeof Create;
    Complete: typeof Complete;
    Refund: typeof RefundSled;
  };

  payments: Map<string, PaymentPlugin>;
}

declare const paymentService: PaymentService;

export default paymentService;
