'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaskaBalance = require('alaska-balance');

var _alaskaBalance2 = _interopRequireDefault(_alaskaBalance);

var _alaskaUser = require('alaska-user');

var _alaskaUser2 = _interopRequireDefault(_alaskaUser);

var _alaska = require('alaska');

var _alaska2 = _interopRequireDefault(_alaska);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class BalancePlugin {

  constructor(service) {
    this.service = service;
    service.payments.balance = this;
  }

  /**
   * 创建支付参数
   * @param {Payment} payment
   * @returns {any}
   */
  async createParams(payment) {
    let currency = payment.currency || _alaskaBalance2.default.defaultCurrency.value;
    let user;
    if (payment.populated('user')) {
      user = payment.user;
    } else {
      const User = _alaskaUser2.default.getModel('User');
      // $Flow
      let userTmp = await User.findById(payment.user);
      user = userTmp;
    }
    if (!user) {
      _alaska2.default.panic('Unknown user for payment');
    }
    let balance = user.get(currency);
    if (balance < payment.amount) {
      _alaska2.default.error('Insufficient balance');
    }

    await user._[currency].income(-payment.amount, payment.title, 'payment');

    payment.currency = currency;
    payment.state = 1;

    return 1;
  }
}
exports.default = BalancePlugin;