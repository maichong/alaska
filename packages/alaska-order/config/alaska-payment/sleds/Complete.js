'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pre = pre;

var _alaskaOrder = require('alaska-order');

var _alaskaOrder2 = _interopRequireDefault(_alaskaOrder);

var _Order = require('alaska-order/models/Order');

var _Order2 = _interopRequireDefault(_Order);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function pre() {
  let payment = this.params.payment;
  if (!payment.orders || !payment.orders.length) return;
  for (let order of payment.orders) {
    if (!order.save) {
      order = await _Order2.default.findById(order);
    }
    if (payment.orders.length === 1) {
      order.payed += payment.amount;
    } else if (!order.payed) {
      //多个订单一起支付
      order.payed = order.pay;
    } else {
      //多个订单一起支付,并且当前订单中已经有已支付金额
      //异常情况
    }
    order.payment = payment.type;
    await _alaskaOrder2.default.run('Pay', { order });
  }
  this.params.done = true;
}