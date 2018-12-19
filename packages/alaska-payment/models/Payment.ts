import { Model } from 'alaska-model';

export default class Payment extends Model {
  static label = 'Payment Logs';
  static icon = 'money';
  static defaultColumns = 'title user type amount state createdAt';
  static defaultSort = '-createdAt';
  static nocreate = true;
  static noupdate = true;

  static actions = {
    complete: {
      title: 'Complete',
      sled: 'Complete',
      style: 'warning',
      confirm: 'COMPLETE_PAYMENT_WARING',
      hidden: 'state'
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
    amount: {
      label: 'Amount',
      type: Number,
      required: true,
      protected: true
    },
    type: {
      label: 'Payment Type',
      type: 'select',
      options: [] as any[],
      required: true
    },
    params: {
      label: 'Params',
      type: String,
      required: true
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
  user: string;
  amount: number;
  type: string;
  params: string;
  state: number;
  failure: string;
  createdAt: Date;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
