// @Flow

import { Model } from 'alaska';
import BALANCE from 'alaska-balance';

export default class Recharge extends Model {

  static label = 'Recharge';
  static icon = 'paypal';
  static titleField = 'title';
  static defaultColumns = 'title user target deposit currency amount type state createdAt';
  static defaultSort = '-createdAt';

  static actions = {
    complete: {
      title: 'Complete',
      sled: 'Complete',
      style: 'warning',
      confirm: 'COMPLETE_RECHARGE_WARING',
      depends: {
        '_id>': '',
        type: 'manual',
        state: 0
      }
    }
  };

  static fields = {
    title: {
      label: 'Title',
      type: String,
      required: true,
      private: true
    },
    user: {
      label: 'User',
      ref: 'alaska-user.User',
      private: true
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
    currency: {
      label: 'Currency',
      type: 'select',
      switch: true,
      options: BALANCE.currencies,
      default: BALANCE.defaultCurrency.value
    },
    deposit: {
      label: 'Deposit',
      ref: 'alaska-balance.Deposit',
      depends: {
        target: 'deposit'
      },
      filters: {
        user: ':user' // 只显示当前用户Deposit列表
      }
    },
    amount: {
      label: 'Amount',
      type: Number,
      required: true,
      private: true
    },
    type: {
      label: 'Payment Type',
      type: 'select',
      switch: true,
      default: 'manual',
      options: [{
        label: 'Manual',
        value: 'manual'
      }],
      required: true
    },
    payment: {
      label: 'Payment Logs',
      ref: 'alaska-payment.Payment',
      disabled: true
    },
    state: {
      label: 'State',
      type: 'select',
      number: true,
      switch: true,
      default: 0,
      options: [{
        label: 'Pending',
        value: 0,
        style: 'info'
      }, {
        label: 'Success',
        value: 1,
        style: 'success'
      }, {
        label: 'Failed',
        value: -1,
        style: 'danger'
      }]
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
