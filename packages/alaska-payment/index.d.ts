import { Service, Plugin, ObjectMap } from 'alaska';
import User from 'alaska-user/models/User';
import Order from 'alaska-order/models/Order';
import Payment from './models/Payment';

export class PaymentPlugin extends Plugin {
  static readonly classOfPaymentPlugin: true;
  readonly instanceOfPaymentPlugin: true;

  createParams(payment: Payment): Promise<any>;
}

export interface CreateParams {
  user: User;
  type: string;
  orders?: string[] | Order[];
  payment?: Payment;
}

export interface CompleteParams {
  payment: Payment;
  done?: boolean;
}

export class PaymentService extends Service {
  models: {
    Payment: typeof Payment;
  };

  payments: ObjectMap<PaymentPlugin>;
}

declare const paymentService: PaymentService;

export default paymentService;
