import { Model, RecordId } from 'alaska-model';
import balanceService from 'alaska-balance';

export default class Recharge extends Model {
  static label = 'Recharge Record';
  static icon = 'paypal';
  static titleField = 'title';
  static defaultColumns = 'title user target deposit currency amount type state createdAt';
  static defaultSort = '-createdAt';

  static actions = {
    complete: {
      title: 'Complete',
      sled: 'Complete',
      icon: 'check',
      color: 'warning',
      confirm: 'COMPLETE_RECHARGE_WARING',
      hidden: {
        $or: [
          {
            id: { $exists: false }
          },
          {
            state: { $ne: 'pending' }
          }
        ]
      }
    }
  };

  static fields = {
    title: {
      label: 'Title',
      type: String,
      required: true,
      protected: true
    },
    user: {
      label: 'User',
      type: 'relationship',
      ref: 'alaska-user.User',
      protected: true
    },
    target: {
      label: 'Target',
      type: 'select',
      default: 'balance',
      required: true,
      checkbox: true,
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
      required: true,
      checkbox: true,
      options: balanceService.getCurrenciesAsync(),
      default: balanceService.getDefaultCurrencyAsync().then((cur) => cur.value)
    },
    deposit: {
      label: 'Deposit',
      type: 'relationship',
      ref: 'alaska-balance.Deposit',
      optional: true,
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
      protected: true
    },
    type: {
      label: 'Payment Type',
      type: 'select',
      checkbox: true,
      default: 'manual',
      options: [{
        label: 'Manual',
        value: 'manual'
      }],
      required: true
    },
    payment: {
      label: 'Payment Logs',
      type: 'relationship',
      ref: 'alaska-payment.Payment',
      disabled: true
    },
    state: {
      label: 'State',
      type: 'select',
      default: 'pending',
      options: [{
        label: 'Pending',
        value: 'pending'
      }, {
        label: 'Success',
        value: 'success'
      }, {
        label: 'Failed',
        value: 'failed'
      }]
    },
    createdAt: {
      label: 'Created At',
      type: Date
    }
  };

  title: string;
  user: RecordId;
  target: 'balance' | 'deposit';
  currency: string;
  deposit: RecordId;
  amount: number;
  type: string;
  payment: RecordId;
  state: 'pending' | 'success' | 'failed';
  createdAt: Date;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
