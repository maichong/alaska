'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _Withdraw = require('../models/Withdraw');

var _Withdraw2 = _interopRequireDefault(_Withdraw);

var _ = require('../');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Withdraw extends _alaska.Sled {
  /**
   * @param params
   *        params.user
   *        [params.currency]
   *        params.amount
   *        [params.note]
   *        [params.title]
   *        [params.withdraw]  前置钩子中生成的记录
   */
  async exec(params) {
    let withdraw = params.withdraw;
    if (withdraw) return withdraw;

    let currency = params.currency || _2.default.defaultCurrency.value;

    if (!_2.default.currenciesMap[currency]) _2.default.error('Unknown currency');

    let amount = Math.abs(params.amount) || _2.default.error('Invalid amount');

    let user = params.user;

    let balance = user.get(currency.toString());
    if (balance < amount) _2.default.error('Insufficient balance');

    if (amount) {
      await user._[currency.toString()].income(-amount, params.title || 'Withdraw', 'withdraw');
    }

    withdraw = new _Withdraw2.default({
      title: params.title,
      note: params.note,
      user: user._id,
      currency,
      amount
    });
    await withdraw.save();
    return withdraw;
  }
}
exports.default = Withdraw;