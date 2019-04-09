import { Plugin } from 'alaska';

export default class PaymentPlugin<O> extends Plugin<O> {
  static readonly classOfPaymentPlugin = true;
  readonly instanceOfPaymentPlugin = true;
}
