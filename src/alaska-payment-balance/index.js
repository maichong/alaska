// @flow

import BALANCE from 'alaska-balance';
import USER from 'alaska-user';
import type { PaymentService } from 'alaska-payment';
import type Payment from 'alaska-payment/models/Payment';
import alaska from 'alaska';

export default class BalancePlugin {
  service: PaymentService;

  constructor(service: PaymentService) {
    this.service = service;
    service.payments.balance = this;
  }

  /**
   * 创建支付参数
   * @param {Payment} payment
   * @returns {any}
   */
  async createParams(payment: Payment): any {
    let currency: string = payment.currency || BALANCE.defaultCurrency.value;
    let user: ?User;
    if (payment.populated('user')) {
      user = payment.user;
    } else {
      const User = USER.getModel('User');
      // $Flow
      let userTmp = await User.findById(payment.user);
      user = userTmp;
    }
    if (!user) {
      alaska.panic('Unknown user for payment');
    }
    let balance = user.get(currency);
    if (balance < payment.amount) {
      alaska.error('Insufficient balance');
    }

    await user._[currency].income(-payment.amount, payment.title, 'payment');

    payment.currency = currency;
    payment.state = 1;

    return 1;
  }
}
