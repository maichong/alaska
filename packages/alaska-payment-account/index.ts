import * as _ from 'lodash';
import User from 'alaska-user/models/User';
import CreateIncome from 'alaska-income/sleds/Create';
import { CurrencyService } from 'alaska-currency';
import { PaymentService, PaymentPlugin } from 'alaska-payment';
import Payment from 'alaska-payment/models/Payment';
import Refund from 'alaska-payment/models/Refund';
import { AccountPaymentPluginConfig } from '.';

interface AccountPaymentOptions {
  account: string;
}

export default class AccountPaymentPlugin extends PaymentPlugin<AccountPaymentPluginConfig> {
  configs: Map<string, AccountPaymentOptions>;

  constructor(pluginConfig: AccountPaymentPluginConfig, service: PaymentService) {
    super(pluginConfig, service);
    if (_.isEmpty(pluginConfig.channels)) throw new Error(`Missing config [alaska-payment/plugins.alaska-payment-account.channels]`);

    this.configs = new Map();
    for (let account of _.keys(pluginConfig.channels)) {
      let options: AccountPaymentOptions = {
        account
      };
      this.configs.set(`account:${account}`, options);
      service.paymentPlugins.set(`account:${account}`, this);
    }
  }

  /**
   * 创建支付参数
   * @param {Payment} payment
   * @returns {any}y
   */
  async createParams(payment: Payment): Promise<any> {
    const options = this.configs.get(payment.type);
    const account = options.account;
    if (!User._fields.hasOwnProperty(account)) throw new Error(`User account field "${account}" not found!`);

    let currency = User._fields[account].currency;
    let currencyService = this.service.lookup('alaska-currency') as CurrencyService;
    if (currencyService) {
      currency = currency || currencyService.defaultCurrencyId;
      if (payment.currency && currency !== payment.currency) throw new Error('Payment currency not match!');
    }
    let user: User;
    if (payment.populated('user')) {
      // @ts-ignore populated
      user = payment.user;
    } else {
      user = await User.findById(payment.user).session(payment.$session());
    }
    if (!user) {
      throw new Error('Unknown user for payment');
    }
    let balance = user.get(account) || 0;
    if (balance < payment.amount) {
      this.service.error('Insufficient balance');
    }

    // 支付、支出
    await CreateIncome.run({
      user,
      amount: -payment.amount,
      title: payment.title,
      type: 'payment',
      account
    }, { dbSession: payment.$session() });

    payment.currency = currency;
    payment.state = 'success';

    return 'success';
  }

  async refund(refund: Refund, payment: Payment): Promise<void> {
    const options = this.configs.get(payment.type);
    const account = options.account;
    if (!User._fields.hasOwnProperty(account)) throw new Error(`User account field "${account}" not found!`);

    let currency = User._fields[account].currency;
    let currencyService = this.service.lookup('alaska-currency') as CurrencyService;
    if (currencyService) {
      currency = currency || currencyService.defaultCurrencyId;
      if (payment.currency && currency !== payment.currency) throw new Error('Payment currency not match!');
    }

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

    await CreateIncome.run({
      user,
      amount: refund.amount,
      title: refund.title,
      type: 'refund',
      account
    }, { dbSession: refund.$session() || payment.$session() });

    refund.currency = currency;
    refund.state = 'success';
  }
}
