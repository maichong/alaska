'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pre = pre;

var _alaskaRecharge = require('alaska-recharge');

var _alaskaRecharge2 = _interopRequireDefault(_alaskaRecharge);

var _Recharge = require('alaska-recharge/models/Recharge');

var _Recharge2 = _interopRequireDefault(_Recharge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function pre() {
  let payment = this.params.payment;
  if (!payment.recharge) return;

  let recharge = payment.recharge;

  let record = await _Recharge2.default.findById(recharge);

  if (!record) _alaskaRecharge2.default.error('Can not find recharge record!');

  await _alaskaRecharge2.default.run('Complete', {
    recharge: record
  });

  this.params.done = true;
}