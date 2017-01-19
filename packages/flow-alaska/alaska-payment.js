// @flow

declare module 'alaska-payment' {
  declare export class PaymentService extends Alaska$Service {
    constructor(options?: Alaska$Service$options):void;
    payments: Object;
  }
  declare var exports: PaymentService;
}
declare module 'alaska-payment/models/Payment' {
  declare class Payment extends Alaska$Model {
    title: string;
    user: User;
    amount: number;
    type: Object;
    params: Object;
    state: number;
    failure: string;
    createdAt: Date;
    currency:string;
    preSave():void;

    alipay_trade_no:string;
    alipay_buyer_email:string;
  }
  declare var exports: Class<Payment>;
}

