'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.relationships = undefined;
exports.preRegister = preRegister;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _User = require('alaska-user/models/User');

var _User2 = _interopRequireDefault(_User);

var _Income = require('../../../models/Income');

var _Income2 = _interopRequireDefault(_Income);

var _Deposit = require('../../../models/Deposit');

var _Deposit2 = _interopRequireDefault(_Deposit);

var _Withdraw = require('../../../models/Withdraw');

var _Withdraw2 = _interopRequireDefault(_Withdraw);

var _2 = require('../../../');

var _3 = _interopRequireDefault(_2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const relationships = exports.relationships = {
  incomes: {
    ref: _Income2.default,
    path: 'user',
    private: true
  },
  deposits: {
    ref: _Deposit2.default,
    path: 'user',
    private: true
  },
  withdraw: {
    ref: _Withdraw2.default,
    path: 'user',
    private: true
  }
};

/**
 * 为User模型增加余额字段和income方法
 */
function preRegister() {
  _3.default._currencies.forEach(c => {
    _User2.default.underscoreMethod(c.value, 'income', async function (amount, title, type) {
      let user = this;
      let balance = user.get(c.value) + amount || 0;
      if (c.precision !== undefined) {
        balance = _lodash2.default.round(balance, c.precision);
      }
      user.set(c.value, balance);
      let income = new _Income2.default({
        type,
        title,
        amount,
        balance,
        target: 'balance',
        currency: c.value,
        user
      });
      await income.save();
      await user.save();
    });
    if (_User2.default.fields[c.value]) return;
    _User2.default.fields[c.value] = {
      label: c.label,
      type: Number,
      default: 0,
      addonAfter: c.unit
    };
  });
}