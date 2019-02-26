import { Model } from 'alaska-model';
import User from 'alaska-user/models/User';
import balanceService from 'alaska-balance';

export default class Withdraw extends Model {
  static label = 'Withdraw';
  static icon = 'share-square';
  static titleField = 'title';
  static defaultColumns = 'title user currency amount state createdAt';
  static defaultSort = '-createdAt';

  static nocreate = true;
  static noremove = true;

  static api = {
    create: 2,
    show: 2,
    paginate: 2
  };

  static actions = {
    update: {
      hidden: true
    },
    accept: {
      title: 'Accept',
      sled: 'WithdrawAccept',
      color: 'success',
      disabled: 'state',
      hidden: 'state'
    },
    reject: {
      title: 'Reject',
      sled: 'WithdrawReject',
      color: 'danger',
      disabled: 'state',
      hidden: 'state'
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
      type: 'relationship',
      ref: 'alaska-user.User',
      required: true,
      static: true
    },
    currency: {
      label: 'Currency',
      type: 'select',
      options: balanceService.getCurrenciesAsync(),
      default: balanceService.getDefaultCurrencyAsync().then((cur) => cur.value),
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
      default: 'pending',
      options: [{
        label: 'Pending',
        value: 'pending'
      }, {
        label: 'Accepted',
        value: 'accepted'
      }, {
        label: 'Rejected',
        value: 'rejected'
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
  state: 'pending' | 'accepted' | 'rejected';
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
