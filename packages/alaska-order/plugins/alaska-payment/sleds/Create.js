"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_payment_1 = require("alaska-payment");
const Payment_1 = require("alaska-payment/models/Payment");
const Order_1 = require("alaska-order/models/Order");
async function pre() {
    const me = this;
    let params = me.params;
    let orders = params.orders;
    if (params.payment || !orders || !Array.isArray(orders) || !orders.length)
        return;
    let user = params.user || alaska_payment_1.default.error('Missing user info');
    let type = params.type || alaska_payment_1.default.error('Missing payment type');
    if (!alaska_payment_1.default.payments.has(type))
        alaska_payment_1.default.error('Unknown payment type');
    let amount = 0;
    let payment = new Payment_1.default({
        user,
        type,
        orders: []
    });
    let currency = '';
    for (let order of orders) {
        if (typeof order === 'string') {
            order = await Order_1.default.findById(order).where('user', user._id).session(me.dbSession);
            if (!order)
                alaska_payment_1.default.error('Order not found');
            if (order.state !== 200) {
                alaska_payment_1.default.error('Order state error');
            }
        }
        payment.orders.push(order._id);
        if (orders.length && currency && currency !== order.currency)
            throw new Error('Currency conflict!');
        if (order.currency) {
            currency = order.currency;
            payment.currency = currency;
        }
        amount += order.pay;
        if (!payment.title) {
            payment.title = order.title;
        }
    }
    payment.amount = amount;
    params.payment = payment;
}
exports.pre = pre;
