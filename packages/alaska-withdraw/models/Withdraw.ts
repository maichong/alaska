import { Model } from 'alaska-model';
import User from 'alaska-user/models/User';

export default class Withdraw extends Model {
  static label = 'Withdraw';
  static icon = 'share-square';
  static titleField = 'title';
  static defaultColumns = 'title user currency amount state createdAt';
  static filterFields = 'state?switch&nolabel user amount?range createdAt?range';
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
      sled: 'Accept',
      color: 'success',
      disabled: {
        state: { $ne: 'pending' }
      },
      hidden: {
        state: { $ne: 'pending' }
      }
    },
    reject: {
      title: 'Reject',
      sled: 'Reject',
      color: 'danger',
      disabled: {
        state: { $ne: 'pending' }
      },
      hidden: {
        state: { $ne: 'pending' }
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
      type: 'relationship',
      ref: 'alaska-user.User',
      required: true,
      static: true
    },
    currency: {
      label: 'Currency',
      type: 'relationship',
      ref: 'alaska-currency.Currency',
      optional: 'alaska-currency',
      switch: true,
      static: true
    },
    account: {
      label: 'Account',
      type: 'select:account',
      required: true
    },
    amount: {
      label: 'Amount',
      type: 'money',
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
  account: string;
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
