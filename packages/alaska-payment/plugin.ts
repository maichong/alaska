import { Plugin } from 'alaska';

export default class PaymentPlugin<C> extends Plugin<C> {
  static readonly classOfPaymentPlugin = true;
  readonly instanceOfPaymentPlugin = true;
}
