import { Plugin } from 'alaska';

export default class PaymentPlugin extends Plugin {
  static readonly classOfPaymentPlugin = true;
  readonly instanceOfPaymentPlugin = true;
  currencies = [] as string[];
}
