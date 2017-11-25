'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _ = require('../');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Income extends _alaska.Model {

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    if (!this.target && this.deposit) {
      this.target = 'deposit';
    }
  }
}
exports.default = Income;
Income.label = 'Income Record';
Income.icon = 'usd';
Income.defaultColumns = 'title user type target deposit currency amount balance createdAt';
Income.defaultSort = '-createdAt';
Income.searchFields = 'title';
Income.nocreate = true;
Income.noupdate = true;
Income.noremove = true;
Income.api = {
  list: 3,
  paginate: 3
};
Income.fields = {
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
    required: true
  },
  type: {
    label: 'Type',
    type: 'select',
    default: '',
    options: [{
      label: 'Unknown',
      value: ''
    }, {
      label: 'Recharge',
      value: 'recharge'
    }, {
      label: 'Withdraw',
      value: 'withdraw'
    }, {
      label: 'Withdraw Rejected',
      value: 'withdraw_rejected'
    }]
  },
  target: {
    label: 'Target',
    type: 'select',
    default: 'balance',
    checkbox: true,
    options: [{
      label: 'Balance',
      value: 'balance'
    }, {
      label: 'Deposit',
      value: 'deposit'
    }]
  },
  deposit: {
    label: 'Deposit',
    ref: 'Deposit',
    depends: {
      target: 'deposit'
    },
    filters: {
      user: ':user' // 只显示当前用户Deposit列表
    }
  },
  currency: {
    label: 'Currency',
    type: 'select',
    options: _2.default.getCurrenciesAsync(),
    default: _2.default.getDefaultCurrencyAsync().then(cur => cur.value)
  },
  amount: {
    label: 'Amount',
    type: Number,
    default: 0
  },
  balance: {
    label: 'Balance',
    type: Number,
    default: 0
  },
  createdAt: {
    label: 'Created At',
    type: Date
  }
};