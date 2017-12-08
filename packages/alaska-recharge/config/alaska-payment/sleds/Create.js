'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pre = pre;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _alaskaPayment = require('alaska-payment');

var _alaskaPayment2 = _interopRequireDefault(_alaskaPayment);

var _Payment = require('alaska-payment/models/Payment');

var _Payment2 = _interopRequireDefault(_Payment);

var _Recharge = require('alaska-recharge/models/Recharge');

var _Recharge2 = _interopRequireDefault(_Recharge);

var _alaskaBalance = require('alaska-balance');

var _alaskaBalance2 = _interopRequireDefault(_alaskaBalance);

var _Deposit = require('alaska-balance/models/Deposit');

var _Deposit2 = _interopRequireDefault(_Deposit);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// @Flow

async function pre() {
  const currenciesMap = _alaskaBalance2.default.currenciesMap;
  let params = this.params;
  // balance | deposit
  let recharge = params.recharge;
  if (!recharge) return;
  let user = params.user || _alaskaPayment2.default.error('Missing user info!');
  let type = params.type || _alaskaPayment2.default.error('Missing payment type!');
  if (!_alaskaPayment2.default.payments[type]) _alaskaPayment2.default.error('Unknown payment type!');
  let amount = parseFloat(params.amount) || _alaskaPayment2.default.error('Missing payment amount!');
  if (amount <= 0) _alaskaPayment2.default.error('Invalid amount!');
  let currency = params.currency || '';
  let deposit = params.deposit || undefined;
  let currencyOpt = _alaskaBalance2.default.defaultCurrency;
  // 如果充值目标为余额
  if (recharge === 'balance') {
    // 必须指定currency货币类型
    if (!currency) _alaskaPayment2.default.error('Currency is required!');
    if (!currenciesMap.hasOwnProperty(currency)) _alaskaPayment2.default.error('Unknown currency type!');
    currencyOpt = currenciesMap[currency];
  }
  // 如果充值目标为储值卡，必须指定deposit储值卡ID
  if (recharge === 'deposit') {
    if (!deposit) _alaskaPayment2.default.error('Deposit id is required!');
    let dep = await _Deposit2.default.findById(deposit).select('title');
    if (!dep) _alaskaPayment2.default.error('Deposit record not found!');
    currencyOpt = currenciesMap[dep.currency];
  }

  if (currencyOpt.precision !== undefined) {
    amount = _lodash2.default.round(amount);
  }
  if (amount <= 0) _alaskaPayment2.default.error('Invalid amount!');

  let record = new _Recharge2.default({
    title: params.title || 'Recharge-' + amount,
    user,
    target: recharge,
    currency,
    amount,
    deposit
  });

  let payment = new _Payment2.default({
    title: params.title || 'Recharge-' + amount,
    user,
    type,
    amount,
    recharge: record.id
  });

  payment.params = await _alaskaPayment2.default.payments[type].createParams(payment);
  await payment.save();

  record.payment = payment.id;
  await record.save();
  params.payment = payment;
}