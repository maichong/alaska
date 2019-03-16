import { Model } from 'alaska-model';

export default class Income extends Model {
  static label = 'Income Record';
  static icon = 'usd';
  static defaultColumns = 'title user type target deposit currency amount balance createdAt';
  static defaultSort = '-createdAt';
  static searchFields = 'title';
  static filterFields = 'user type?nolabel&switch target?nolabel deposit currency?nolabel&switch amount?range createdAt?range';

  static api = {
    paginate: 2,
    show: 2
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
      disabled: '!isNew',
      required: true
    },
    type: {
      label: 'Type',
      type: 'select',
      disabled: '!isNew',
      default: '',
      options: [{
        label: 'Unknown',
        value: ''
      }, {
        label: 'Payment',
        value: 'payment'
      }, {
        label: 'Refund',
        value: 'refund'
      }, {
        label: 'Recharge',
        value: 'recharge',
        optional: 'alaska-recharge'
      }, {
        label: 'Withdraw',
        value: 'withdraw',
        optional: 'alaska-withdraw'
      }, {
        label: 'Withdraw Rejected',
        value: 'withdraw_rejected',
        optional: 'alaska-withdraw'
      }, {
        label: 'Commission',
        value: 'commission',
        optional: 'alaska-commission'
      }]
    },
    target: {
      label: 'Target',
      type: 'select',
      disabled: '!isNew',
      default: 'account',
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
      disabled: '!isNew',
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
      disabled: '!isNew',
      type: 'relationship',
      ref: 'alaska-currency.Currency',
      optional: 'alaska-currency'
    },
    amount: {
      label: 'Amount',
      type: Number,
      format: '0,0.00',
      disabled: '!isNew',
      default: 0
    },
    balance: {
      label: 'Balance',
      type: Number,
      format: '0,0.00',
      disabled: '!isNew',
      default: 0
    },
    createdAt: {
      label: 'Created At',
      type: Date,
      disabled: '!isNew'
    }
  };

  title: string;
  user: string;
  type: string;
  target: string;
  account: string;
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
