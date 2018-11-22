import { Model } from 'alaska-model';
import service from '../';

export default class Income extends Model {
  static label = 'Income Record';
  static icon = 'usd';
  static defaultColumns = 'title user type target deposit currency amount balance createdAt';
  static defaultSort = '-createdAt';
  static searchFields = 'title';
  static nocreate = true;
  static noupdate = true;
  static noremove = true;

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
    type: {
      label: 'Type',
      type: 'select',
      default: '',
      options: [{
        label: 'Unknown',
        value: ''
      }, {
        label: 'Recharge',
        value: 'recharge'
      }, {
        label: 'Withdraw',
        value: 'withdraw'
      }, {
        label: 'Withdraw Rejected',
        value: 'withdraw_rejected'
      }]
    },
    target: {
      label: 'Target',
      type: 'select',
      default: 'balance',
      checkbox: true,
      options: [{
        label: 'Balance',
        value: 'balance'
      }, {
        label: 'Deposit',
        value: 'deposit'
      }]
    },
    deposit: {
      label: 'Deposit',
      type: 'relationship',
      ref: 'Deposit',
      hidden: {
        target: {
          $ne: 'deposit'
        }
      },
      filters: {
        user: ':user' // 只显示当前用户Deposit列表
      }
    },
    currency: {
      label: 'Currency',
      type: 'select', // TODO:
      // options: service.getCurrenciesAsync(),
      // default: service.getDefaultCurrencyAsync().then((cur) => cur.value)
      options: [{}]
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
    }
  };

  title: string;
  user: string;
  type: string;
  target: string;
  currency: string;
  deposit: string;
  amount: number;
  balance: number;
  createdAt: Date;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    if (!this.target && this.deposit) {
      this.target = 'deposit';
    }
  }
}
