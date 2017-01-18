// @flow

declare module 'alaska-payment' {
  declare class PaymentService extends Alaska$Service {
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
  state: Object;
  failure: string;
  createdAt: Date;
  preSave():void;
  }
  declare var exports: Class<Payment>;
}

