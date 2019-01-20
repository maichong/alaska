import { RecordId, Model } from 'alaska-model';
import Payment, { getCurrenciesAsync, getDefaultCurrencyAsync } from './Payment';

export default class Refund extends Model {
  static label = 'Refund';
  static icon = 'undo';
  static defaultColumns = 'title user payment order type amount state createdAt';
  static defaultSort = '-createdAt';
  static nocreate = true;
  static noupdate = true;

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
    payment: {
      label: 'Payment',
      type: 'relationship',
      ref: Payment,
      protected: true
    },
    type: {
      label: 'Payment Type',
      type: 'select',
      options: [] as any[],
      required: true
    },
    currency: {
      label: 'Currency',
      type: 'select',
      options: getCurrenciesAsync(),
      default: getDefaultCurrencyAsync().then((cur) => cur.value)
    },
    amount: {
      label: 'Amount',
      type: Number,
      required: true,
      protected: true
    },
    state: {
      label: 'State',
      type: 'select',
      number: true,
      default: 0,
      options: [{
        label: 'Pending',
        value: 0
      }, {
        label: 'Success',
        value: 1
      }, {
        label: 'Failed',
        value: -1
      }]
    },
    failure: {
      label: 'Failure Reason',
      type: String
    },
    createdAt: {
      label: 'Created At',
      type: Date
    }
  };

  title: string;
  user: RecordId;
  payment: RecordId;
  currency: string;
  amount: number;
  type: string;
  state: number;
  failure: string;
  createdAt: Date;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}