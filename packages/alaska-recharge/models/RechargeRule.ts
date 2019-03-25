import { Model } from 'alaska-model';

export default class RechargeRule extends Model {
  static label = 'Recharge Rule';
  static icon = 'exchange';
  static defaultColumns = 'title sort createdAt';
  static defaultSort = '-sort';

  static fields = {
    payment: {
      label: 'Payment Type',
      type: 'select:payment',
      required: true
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
    rechargeAccount: {
      label: 'Recharge Account',
      type: 'select:account',
      disabled: '!isNew',
      hidden: {
        target: {
          $ne: 'account'
        }
      },
    },
    type: {
      label: 'Type',
      type: 'select',
      default: 'rate',
      options: [{
        label: 'Rate',
        value: 'rate'
      }, {
        label: 'Amount',
        value: 'amount'
      }]
    },
    paymentCurrency: {
      label: 'Payment Currency',
      type: 'relationship',
      ref: 'alaska-currency.Currency',
      optional: 'alaska-currency',
      defaultField: 'isDefault',
      switch: true,
      required: true,
    },
    paymentAmount: {
      label: 'Payment Amount',
      type: Number,
      default: 0,
      format: '',
      hidden: {
        type: 'rate'
      }
    },
    rechargeCurrency: {
      label: 'Recharge Currency',
      type: 'relationship',
      ref: 'alaska-currency.Currency',
      optional: 'alaska-currency',
      defaultField: 'isDefault',
      switch: true,
      required: true,
    },
    rechargeAmount: {
      label: 'Recharge Amount',
      type: Number,
      default: 0,
      format: '',
      hidden: {
        type: 'rate'
      }
    },
    rate: {
      label: 'Rate',
      type: Number,
      default: 0,
      format: '',
      hidden: {
        type: 'amount'
      }
    },
    createdAt: {
      label: 'Created At',
      type: Date
    }
  };

  payment: string;
  target: 'account' | 'deposit';
  rechargeAccount: string;
  type: 'rate' | 'amount';
  paymentCurrency: string;
  paymentAmount: number;
  rechargeCurrency: string;
  rechargeAmount: number;
  rate: number;
  createdAt: Date;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
