import { Service, Plugin } from 'alaska';
import Payment from './models/Payment';

export class PaymentPlugin extends Plugin {
  static readonly classOfPaymentPlugin: true;
  readonly instanceOfPaymentPlugin: true;

  createParams(payment: Payment): Promise<any>;
}

export interface CreateParams {
  payment?: | Payment;
}

export interface CompleteParams {
  payment: Payment;
  done?: boolean;
}

export class PaymentService extends Service {
  models: {
    Payment: typeof Payment;
  }
}

declare const paymentService: PaymentService;

export default paymentService;
