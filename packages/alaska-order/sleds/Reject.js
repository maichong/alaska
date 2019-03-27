"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const alaska_sled_1 = require("alaska-sled");
const __1 = require("..");
class Reject extends alaska_sled_1.Sled {
    async exec(params) {
        if (this.result)
            return this.result;
        if (!params.record && _.isEmpty(params.records))
            throw new Error('record or records is required');
        let records = _.size(params.records) ? params.records : [params.record];
        if (_.find(records, (o) => ![300].includes(o.state)))
            __1.default.error('Order state error');
        const paymentService = __1.default.lookup('alaska-payment');
        for (let order of records) {
            order.state = 900;
            if (!order.failure) {
                order.failure = 'Rejected';
            }
            await order.save({ session: this.dbSession });
            order.createLog('Order rejected', this.dbSession);
            if (paymentService) {
                let payment = await paymentService.models.Payment.findOne({
                    state: 'success',
                    orders: order._id
                }).session(this.dbSession);
                if (payment) {
                    let refund = new paymentService.models.Refund();
                    refund.title = payment.title;
                    refund.user = payment.user;
                    refund.currency = payment.currency;
                    refund.type = payment.type;
                    refund.amount = payment.amount;
                    refund.state = 'pending';
                    await paymentService.sleds.Refund.run({
                        payment,
                        refund
                    }, { dbSession: this.dbSession });
                }
            }
        }
        return records;
    }
}
exports.default = Reject;
