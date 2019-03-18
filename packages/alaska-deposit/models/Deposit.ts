import * as _ from 'lodash';
import * as moment from 'moment';
import { Model } from 'alaska-model';

export default class Deposit extends Model {
  static label = 'Deposit';
  static icon = 'credit-card';
  static titleField = 'title';
  static defaultColumns = 'title user currency amount balance createdAt expiredAt';
  static defaultSort = '-createdAt';

  static api = {
    show: 2,
    list: 2,
    paginate: 2
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
      type: 'relationship',
      ref: 'alaska-currency.Currency',
      optional: 'alaska-currency',
      defaultField: 'isDefault',
      switch: true,
    },
    amount: {
      label: 'Amount',
      type: 'money'
    },
    balance: {
      label: 'Balance',
      type: 'money'
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

  id: string;
  title: string;
  user: string;
  currency: string;
  amount: number;
  balance: number;
  createdAt: Date;
  expiredAt: Date;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    if (!this.expiredAt) {
      // TODO: 可设置过期时间
      this.expiredAt = moment().add('1', 'months').toDate();
    }
  }
}
