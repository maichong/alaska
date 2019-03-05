import { Plugin } from 'alaska';

export default class PaymentPlugin extends Plugin {
  static readonly classOfPaymentPlugin = true;
  readonly instanceOfPaymentPlugin = true;
  currencies: Set<string> = new Set();
}
