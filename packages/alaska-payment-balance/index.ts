import balanceService from 'alaska-balance';
import User from 'alaska-user/models/User';
import { PaymentService, PaymentPlugin } from 'alaska-payment';
import Payment from 'alaska-payment/models/Payment';
import Refund from 'alaska-payment/models/Refund';

export default class BalancePaymentPlugin extends PaymentPlugin {
  constructor(service: PaymentService) {
    super(service);
    balanceService.getCurrenciesAsync().then((list) => {
      list.forEach((cur) => {
        this.currencies.add(cur.value);
        service.payments.set(`balance:${cur.value}`, this);
      });
    });
  }

  /**
   * 创建支付参数
   * @param {Payment} payment
   * @returns {any}
   */
  async createParams(payment: Payment): Promise<any> {
    const currency = payment.type.split(':')[1];
    if (!currency) throw new Error('Unkown currency!');
    if (!this.currencies.has(currency)) throw new Error('Unsupported currency!');
    if (payment.currency && payment.currency !== currency) throw new Error('Currency not match!');
    let user: User;
    if (payment.populated('user')) {
      // @ts-ignore populated
      user = payment.user;
    } else {
      user = await User.findById(payment.user);
    }
    if (!user) {
      throw new Error('Unknown user for payment');
    }
    let balance = user.get(currency) || 0;
    if (balance < payment.amount) {
      this.service.error('Insufficient balance');
    }

    await user._[currency].income(-payment.amount, payment.title, 'payment');

    payment.currency = currency;
    payment.state = 'success';

    return 'success';
  }

  async refund(refund: Refund, payment: Payment): Promise<void> {
    const currency = refund.type.split(':')[1];
    if (!currency) throw new Error('Unkown currency');
    if (!this.currencies.has(currency)) throw new Error('Unsupported currency!');
    if (refund.currency && refund.currency !== currency) throw new Error('Currency not match');
    let user: User;
    if (refund.populated('user')) {
      // @ts-ignore populated
      user = refund.user;
    } else {
      user = await User.findById(refund.user);
    }
    if (!user) {
      throw new Error('Unknown user for refund');
    }

    await user._[currency].income(refund.amount, refund.title, 'refund');

    refund.currency = currency;
    refund.state = 'success';
  }
}
