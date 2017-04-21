// @flow

import { Model } from 'alaska';

export default class Payment extends Model {

  static label = 'Payment Logs';
  static icon = 'money';
  static defaultColumns = 'title user type amount state createdAt';
  static defaultSort = '-createdAt';
  static nocreate = true;
  static noedit = true;

  static api = {
    create: 3,
    show: 3
  };

  static fields = {
    title: {
      label: 'Title',
      type: String,
      require: true,
      private: true
    },
    user: {
      label: 'User',
      ref: 'alaska-user.User',
      private: true
    },
    amount: {
      label: 'Amount',
      type: Number,
      require: true,
      private: true
    },
    type: {
      label: 'Payment Type',
      type: 'select',
      options: [],
      require: true
    },
    params: {
      label: 'Params',
      type: Object,
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
  user: User;
  amount: number;
  type: Object;
  params: Object;
  state: number;
  failure: string;
  createdAt: Date;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
