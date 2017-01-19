// @flow

import { Model } from 'alaska';
import BALANCE from 'alaska-balance';

export default class Commission extends Model {

  static label = 'Commission';
  static icon = 'money';
  static titleField = 'title';
  static defaultColumns = 'title user contributor order amount level state createdAt balancedAt';
  static defaultSort = '-createdAt';

  static api = {
    list: 3
  };

  static populations = {
    contributor: {
      select: '@tiny'
    }
  };

  static actions = {
    balance: {
      title: 'Balance now',
      style: 'success',
      sled: 'Balance',
      depends: {
        state: 0
      }
    }
  };

  static fields = {
    title: {
      label: 'Title',
      type: String,
      required: true
    },
    user: {
      label: 'User',
      ref: 'alaska-user.User',
      index: true
    },
    contributor: {
      label: 'Contributor',
      ref: 'alaska-user.User'
    },
    order: {
      label: 'Order',
      ref: 'alaska-order.Order',
      optional: true
    },
    main: {
      label: 'Main Commission',
      ref: 'Commission',
      private: true
    },
    level: {
      label: 'Level',
      type: Number
    },
    currency: {
      label: 'Currency',
      type: 'select',
      // $Flow options:?Object[] 属性可以不存在  BALANCE.currencies:Object[] 一定有值 类型不符合？
      options: BALANCE.currencies,
      default: BALANCE.defaultCurrency.value
    },
    amount: {
      label: 'Amount',
      type: Number,
      default: 0
    },
    state: {
      label: 'State',
      type: 'select',
      number: true,
      default: 0,
      options: [{
        label: 'Unbalanced',
        value: 0
      }, {
        label: 'Balanced',
        value: 1
      }, {
        label: 'Invalid',
        value: -1
      }]
    },
    error: {
      label: 'Error',
      type: String
    },
    createdAt: {
      label: 'Created At',
      type: Date
    },
    balancedAt: {
      label: 'Balanced At',
      type: Date
    }
  };

  title: string;
  user: Object;
  contributor: Object;
  order: Object;
  main: Object;
  level: number;
  currency: Object;
  amount: number;
  state: number;
  error: string;
  createdAt: Date;
  balancedAt: Date;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
