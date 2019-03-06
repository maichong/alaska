import { Model, RecordId } from 'alaska-model';
import balanceService from 'alaska-balance';

export default class Commission extends Model {
  static label = 'Commission';
  static icon = 'jpy';
  static titleField = 'title';
  static defaultColumns = 'title user contributor order amount level state createdAt balancedAt';
  static defaultSort = '-createdAt';

  static api = {
    paginate: 3,
    list: 3
  };

  static populations = {
    contributor: {
      select: ':tiny'
    }
  };

  static actions = {
    balance: {
      icon: 'check',
      after: 'add',
      title: 'Balance now',
      color: 'success',
      sled: 'Balance',
      hidden: {
        state: {
          $ne: 'pending'
        }
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
      type: 'relationship',
      ref: 'alaska-user.User',
      required: true,
      index: true
    },
    contributor: {
      label: 'Contributor',
      type: 'relationship',
      ref: 'alaska-user.User'
    },
    order: {
      label: 'Order',
      type: 'relationship',
      ref: 'alaska-order.Order',
      optional: 'alaska-order.Order',
      index: true
    },
    main: {
      label: 'Main Commission',
      type: 'relationship',
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
      options: balanceService.getCurrenciesAsync(),
      default: balanceService.getDefaultCurrencyAsync().then((cur) => cur.value)
    },
    amount: {
      label: 'Amount',
      type: Number,
      format: '0,0.00',
      required: true,
      default: 0
    },
    state: {
      label: 'State',
      type: 'select',
      default: 'pending',
      options: [{
        label: 'Pending',
        value: 'pending'
      }, {
        label: 'Balanced',
        value: 'balanced'
      }, {
        label: 'Failed',
        value: 'failed'
      }]
    },
    failure: {
      label: 'Failure',
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
  user: RecordId;
  contributor: RecordId;
  order: RecordId;
  main: RecordId;
  level: number;
  currency: string;
  amount: number;
  state: 'pending' | 'balanced' | 'failed';
  failure: string;
  createdAt: Date;
  balancedAt: Date;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
