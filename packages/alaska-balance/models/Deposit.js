'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _alaska = require('alaska');

var _2 = require('../');

var _3 = _interopRequireDefault(_2);

var _Income = require('./Income');

var _Income2 = _interopRequireDefault(_Income);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Deposit extends _alaska.Model {

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    if (!this.expiredAt) {
      this.expiredAt = (0, _moment2.default)().add('1', 'months');
    }
  }

  async income(amount, title, type) {
    let c = _3.default.currenciesMap[this.currency] || _3.default.defaultCurrency;
    let balance = this.balance + amount || 0;
    if (c.precision !== undefined) {
      balance = _lodash2.default.round(balance, c.precision);
    }
    this.balance = balance;
    let income = new _Income2.default({
      type,
      title,
      amount,
      balance,
      currency: this.currency || c.value,
      user: this.user,
      target: 'deposit',
      deposit: this.id
    });
    await income.save();
    await this.save();
  }
}
exports.default = Deposit;
Deposit.label = 'Deposit';
Deposit.icon = 'credit-card';
Deposit.titleField = 'title';
Deposit.defaultColumns = 'title user currency amount balance createdAt expiredAt';
Deposit.defaultSort = '-createdAt';
Deposit.api = {
  list: 3,
  paginate: 3
};
Deposit.fields = {
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
  currency: {
    label: 'Currency',
    type: 'select',
    options: _3.default.getCurrenciesAsync(),
    default: _3.default.getDefaultCurrencyAsync().then(cur => cur.value)
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
  },
  expiredAt: {
    label: 'Expired At',
    type: Date
  }
};