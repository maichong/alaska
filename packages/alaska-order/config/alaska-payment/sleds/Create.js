'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pre = pre;

var _alaskaPayment = require('alaska-payment');

var _alaskaPayment2 = _interopRequireDefault(_alaskaPayment);

var _Payment = require('alaska-payment/models/Payment');

var _Payment2 = _interopRequireDefault(_Payment);

var _Order = require('alaska-order/models/Order');

var _Order2 = _interopRequireDefault(_Order);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function pre() {
  let params = this.params;
  let orders = params.orders;
  if (!orders || !Array.isArray(orders) || !orders.length) return;
  let user = params.user || _alaskaPayment2.default.error('Missing user info');
  let type = params.type || _alaskaPayment2.default.error('Missing payment type');
  if (!_alaskaPayment2.default.payments[type]) _alaskaPayment2.default.error('Unknown payment type');

  let amount = 0;
  let payment = new _Payment2.default({
    user,
    type,
    orders: []
  });
  for (let order of orders) {
    if (typeof order === 'string') {
      order = await _Order2.default.findById(order).where('user', user._id);
      if (!order) _alaskaPayment2.default.error('Order not found');
      if (order.state !== 200) {
        _alaskaPayment2.default.error('Order state error');
      }
    }
    payment.orders.push(order._id);
    amount += order.pay;
    if (!payment.title) {
      payment.title = order.title;
    }
  }
  payment.amount = amount;
  payment.params = await _alaskaPayment2.default.payments[type].createParams(payment);
  await payment.save();
  params.payment = payment;
}