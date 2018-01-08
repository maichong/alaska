'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _ = require('../');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Withdraw extends _alaska.Model {

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    if (!this.title) {
      this.title = 'Withdraw';
    }
  }
}
exports.default = Withdraw;
Withdraw.label = 'Withdraw';
Withdraw.icon = 'share-square';
Withdraw.titleField = 'title';
Withdraw.defaultColumns = 'title user currency amount state createdAt';
Withdraw.defaultSort = '-createdAt';
Withdraw.nocreate = true;
Withdraw.noremove = true;
Withdraw.api = {
  create: 3,
  list: 3,
  paginate: 3
};
Withdraw.actions = {
  update: {
    hidden: true
  },
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
Withdraw.fields = {
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
    options: _2.default.getCurrenciesAsync(),
    default: _2.default.getDefaultCurrencyAsync().then(cur => cur.value),
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