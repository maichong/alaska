/**
 * @copyright Maichong Software Ltd. 2017 http://maichong.it
 * @date 2017-04-20
 * @author Liang <liang@maichong.it>
 */

import { Model } from 'alaska';
import service from '../';

export default class Deposit extends Model {

  static label = 'Deposit';
  static icon = 'credit-card';
  static titleField = 'title';
  static defaultColumns = 'title user currency amount balance createdAt';
  static defaultSort = '-createdAt';

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

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
