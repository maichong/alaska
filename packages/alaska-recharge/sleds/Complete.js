'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _User = require('alaska-user/models/User');

var _User2 = _interopRequireDefault(_User);

var _alaskaBalance = require('alaska-balance');

var _alaskaBalance2 = _interopRequireDefault(_alaskaBalance);

var _Deposit = require('alaska-balance/models/Deposit');

var _Deposit2 = _interopRequireDefault(_Deposit);

var _Income = require('alaska-balance/models/Income');

var _Income2 = _interopRequireDefault(_Income);

var _ = require('../');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// @Flow

class Complete extends _alaska.Sled {
  async exec(params) {
    const currenciesMap = _alaskaBalance2.default.currenciesMap;
    let recharge = params.recharge;
    if (recharge.state !== 0) _2.default.error('Recharge record state error!');

    let income = new _Income2.default({
      title: recharge.title,
      type: 'recharge',
      user: recharge.user,
      amount: recharge.amount,
      target: recharge.target,
      current: recharge.currency
    });
    if (recharge.target === 'balance') {
      let currency = recharge.currency;
      let currencyOpt = currenciesMap[currency];
      if (!currencyOpt || !currencyOpt.value) {
        _2.default.error('Unknown currency!');
      }
      let user = await _User2.default.findById(recharge.user);
      if (!user) _2.default.error('Recharge user not found!');
      let balance = parseFloat(user.get(currency)) || 0;
      balance += recharge.amount;
      user.set(currency, balance);
      await user.save();
      income.balance = balance;
      await income.save();
    } else if (recharge.target === 'deposit') {
      let deposit = await _Deposit2.default.findById(recharge.deposit);
      if (!deposit) _2.default.error('Can not find deposit!');
      deposit.balance += recharge.amount;
      await deposit.save();
      income.currency = deposit.currency;
      income.balance = deposit.balance;
      income.deposit = deposit.id;
      await income.save();
    } else {
      _2.default.error('In valid recharge target');
    }

    recharge.state = 1;
    await recharge.save();
  }
}
exports.default = Complete;