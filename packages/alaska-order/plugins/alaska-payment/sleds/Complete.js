"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Pay_1 = require("alaska-order/sleds/Pay");
const Order_1 = require("alaska-order/models/Order");
async function pre() {
    const me = this;
    let record = me.params.record;
    if (!record.orders || !record.orders.length)
        return;
    for (let order of record.orders) {
        if (!order.save) {
            order = await Order_1.default.findById(order).session(me.dbSession);
        }
        if (record.orders.length === 1) {
            order.payed += record.amount;
        }
        else {
            order.payed = order.pay;
        }
        order.payment = record.type;
        await Pay_1.default.run({ record: order }, { dbSession: me.dbSession });
    }
    me.params.done = true;
}
exports.pre = pre;
