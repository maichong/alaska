'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.alipay = alipay;

var _alaskaPayment = require('alaska-payment');

var _alaskaPayment2 = _interopRequireDefault(_alaskaPayment);

var _Payment = require('alaska-payment/models/Payment');

var _Payment2 = _interopRequireDefault(_Payment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function alipay(ctx) {
  ctx.status = 400;
  ctx.body = 'ERR';
  if (ctx.method !== 'POST') return;
  let body = ctx.state.body || ctx.request.body;
  if (!body || body.trade_status !== 'TRADE_SUCCESS') return;
  let success = await _alaskaPayment2.default.payments.alipay.verify(body);
  if (!success) return;
  let paymentId = body.out_trade_no;
  // $Flow
  let payment = await _Payment2.default.findById(paymentId);
  if (!payment) return;
  payment.alipay_trade_no = body.trade_no;
  payment.alipay_buyer_email = body.buyer_email;
  try {
    await _alaskaPayment2.default.run('Complete', { payment });
    ctx.body = 'OK';
    ctx.status = 200;
  } catch (error) {
    console.error(error.stack);
    ctx.status = 500;
    ctx.body = 'ERR';
  }
}