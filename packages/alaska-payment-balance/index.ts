import balanceService from 'alaska-balance';
import User from 'alaska-user/models/User';
import { PaymentService, PaymentPlugin } from 'alaska-payment';
import Payment from 'alaska-payment/models/Payment';

export default class BalancePaymentPlugin extends PaymentPlugin {
  constructor(service: PaymentService) {
    super(service);
    balanceService.getCurrenciesAsync().then((list) => {
      list.forEach((cur) => {
        service.payments[`balance:${cur.value}`] = this;
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
    if (!currency) throw new Error('Unkown currency');
    if (payment.currency && payment.currency !== currency) throw new Error('Currency not match');
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
    let balance = user.get(currency);
    if (balance < payment.amount) {
      this.service.error('Insufficient balance');
    }

    await user._[currency].income(-payment.amount, payment.title, 'payment');

    payment.currency = currency;
    payment.state = 1;

    return 1;
  }
}