import _ from 'lodash';
import moment from 'moment';
import { Model } from 'alaska';
import service from '../';
import Income from './Income';

export default class Deposit extends Model<Deposit> {
  static label = 'Deposit';
  static icon = 'credit-card';
  static titleField = 'title';
  static defaultColumns = 'title user currency amount balance createdAt expiredAt';
  static defaultSort = '-createdAt';

  static api = {
    list: 3,
    paginate: 3
  };

  static fields = {
    title: {
      label: 'Title',
      type: String,
      required: true
    },
    user: {
      label: 'User',
      type: 'relationship',
      ref: 'alaska-user.User',
      index: true,
      required: true
    },
    currency: {
      label: 'Currency',
      type: 'select',
      options: service.getCurrenciesAsync(),
      default: service.getDefaultCurrencyAsync().then((cur) => cur.value)
    },
    amount: {
      label: 'Amount',
      type: Number,
      default: 0
    },
    balance: {
      label: 'Balance',
      type: Number,
      default: 0
    },
    createdAt: {
      label: 'Created At',
      type: Date
    },
    expiredAt: {
      label: 'Expired At',
      type: Date
    }
  };

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    if (!this.expiredAt) {
      this.expiredAt = moment().add('1', 'months');
    }
  }

  async income(amount: number, title: string, type?: string) {
    let c = service.currenciesMap[this.currency] || service.defaultCurrency;
    let balance = (this.balance + amount) || 0;
    if (c.precision !== undefined) {
      balance = _.round(balance, c.precision);
    }
    this.balance = balance;
    let income = new Income({
      type,
      title,
      amount,
      balance,
      currency: this.currency || c.value,
      user: this.user,
      target: 'deposit',
      deposit: this.id
    });
    await income.save();
    await this.save();
  }
}
