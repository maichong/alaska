"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const alaska_sled_1 = require("alaska-sled");
const OrderGoods_1 = require("../models/OrderGoods");
const __1 = require("..");
class AcceptRefund extends alaska_sled_1.Sled {
    async exec(params) {
        if (this.result)
            return this.result;
        if (!params.record && _.isEmpty(params.records))
            throw new Error('record or records is required');
        let records = _.size(params.records) ? params.records : [params.record];
        if (_.find(records, (o) => ![800].includes(o.state)))
            __1.default.error('Order state error');
        for (let order of records) {
            let refundAmount = order.refundAmount;
            order.state = 600;
            order.closed = true;
            order.lastRefundAmount = order.refundAmount;
            order.lastRefundQuantity = order.refundQuantity;
            order.refundedAmount = (order.refundedAmount || 0) + order.refundAmount;
            order.refundedQuantity = (order.refundedQuantity || 0) + order.refundQuantity;
            order.refundTimeout = null;
            order.refundAmount = 0;
            order.refundQuantity = 0;
            const paymentService = __1.default.lookup('alaska-payment');
            if (refundAmount && paymentService) {
                const { Payment, Refund } = paymentService.models;
                let payment = await Payment.findOne({
                    state: 'success',
                    orders: order._id
                }).session(this.dbSession);
                if (payment) {
                    let refund = new Refund();
                    refund.title = payment.title;
                    refund.user = payment.user;
                    refund.currency = payment.currency;
                    refund.type = payment.type;
                    refund.amount = refundAmount;
                    refund.state = 'pending';
                    await paymentService.sleds.Refund.run({
                        payment,
                        refund
                    }, { dbSession: this.dbSession });
                }
                else {
                    console.error(`Not payment found for refund, Order:${order.id}`);
                }
            }
            await order.save({ session: this.dbSession });
            order.createLog('Order refunded');
            let goods = await OrderGoods_1.default.find({ order: order._id }).session(this.dbSession);
            await Promise.all(goods.map(async (item) => {
                item.lastRefundAmount = item.refundAmount;
                item.lastRefundQuantity = item.refundQuantity;
                item.refundAmount = 0;
                item.refundQuantity = 0;
                await item.save({ session: this.dbSession });
            }));
        }
        return records;
    }
}
exports.default = AcceptRefund;
