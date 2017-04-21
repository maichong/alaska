// @flow

import { Model } from 'alaska';
import service from '../';

export default class Income extends Model {

  static label = 'Income Record';
  static icon = 'usd';
  static defaultColumns = 'title user type target deposit currency amount balance createdAt';
  static defaultSort = '-createdAt';
  static searchFields = 'title';
  static nocreate = true;
  static noedit = true;
  static noremove = true;

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
      switch: true,
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
      ref: 'Deposit',
      depends: {
        target: 'deposit'
      },
      filters: {
        user: ':user' // 只显示当前用户Deposit列表
      }
    },
    currency: {
      label: 'Currency',
      type: 'select',
      options: service.currencies,
      default: service.defaultCurrency.value
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
  user: User;
  type: string;
  currency: string;
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
