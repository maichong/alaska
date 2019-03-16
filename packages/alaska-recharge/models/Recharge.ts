import { Model, RecordId } from 'alaska-model';

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
      default: 'account',
      required: true,
      switch: true,
      options: [{
        label: 'Account',
        value: 'account'
      }, {
        label: 'Deposit',
        value: 'deposit',
        optional: 'alaska-deposit'
      }]
    },
    account: {
      label: 'Account',
      type: 'select:account',
      disabled: '!isNew',
      hidden: {
        target: {
          $ne: 'account'
        }
      },
    },
    deposit: {
      label: 'Deposit',
      type: 'relationship',
      ref: 'alaska-deposit.Deposit',
      optional: 'alaska-deposit',
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
      type: 'relationship',
      ref: 'alaska-currency.Currency',
      optional: 'alaska-currency',
      defaultField: 'isDefault',
      switch: true,
      required: true,
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
  target: 'account' | 'deposit';
  currency: string;
  account: string;
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
