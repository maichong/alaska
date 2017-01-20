// @flow

import { Model } from 'alaska';
import service from '../';

export default class Withdraw extends Model {

  static label = 'Withdraw';
  static icon = 'share-square';
  static titleField = 'title';
  static defaultColumns = 'title user currency amount state createdAt';
  static defaultSort = '-createdAt';

  static nocreate = true;
  static noremove = true;

  static api = {
    create: 3,
    list: 3
  };

  static actions = {
    save: false,
    accept: {
      title: 'Accept',
      sled: 'WithdrawAccept',
      style: 'success',
      depends: {
        state: 0
      }
    },
    reject: {
      title: 'Reject',
      sled: 'WithdrawReject',
      style: 'danger',
      depends: {
        state: 0
      }
    }
  };

  static fields = {
    title: {
      label: 'Title',
      type: String,
      static: true
    },
    user: {
      label: 'User',
      ref: 'alaska-user.User',
      required: true,
      static: true
    },
    currency: {
      label: 'Currency',
      type: 'select',
      options: service.currencies,
      default: service.defaultCurrency.value,
      static: true
    },
    amount: {
      label: 'Amount',
      type: Number,
      required: true,
      static: true
    },
    note: {
      label: 'Note',
      type: String,
      multiLine: true,
      static: true
    },
    createdAt: {
      label: 'Created At',
      type: Date,
      static: true
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
        label: 'Accepted',
        value: 1
      }, {
        label: 'Rejected',
        value: -1
      }],
      static: true
    },
    reason: {
      label: 'Reject Reason',
      type: String
    }
  };

  title: string;
  user: User;
  currency: string;
  amount: number;
  note: string;
  createdAt: Date;
  state: number;
  reason: string;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    if (!this.title) {
      this.title = 'Withdraw';
    }
  }
}
