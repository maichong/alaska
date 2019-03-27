"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const alaska_sled_1 = require("alaska-sled");
const OrderGoods_1 = require("../models/OrderGoods");
const __1 = require("..");
class RejectRefund extends alaska_sled_1.Sled {
    async exec(params) {
        if (this.result)
            return this.result;
        if (!params.record && _.isEmpty(params.records))
            throw new Error('record or records is required');
        let records = _.size(params.records) ? params.records : [params.record];
        if (_.find(records, (o) => ![800].includes(o.state)))
            __1.default.error('Order state error');
        for (let order of records) {
            if (order.closed) {
                order.state = 600;
            }
            else if (order.shipped) {
                order.state = 500;
            }
            else {
                order.state = 400;
            }
            order.refundTimeout = null;
            order.refundAmount = 0;
            order.refundQuantity = 0;
            await order.save({ session: this.dbSession });
            order.createLog('Refund rejected', this.dbSession);
            let goods = await OrderGoods_1.default.find({ order: order._id });
            await Promise.all(goods.map(async (item) => {
                item.refundAmount = 0;
                item.refundQuantity = 0;
                await item.save({ session: this.dbSession });
            }));
        }
        return records;
    }
}
exports.default = RejectRefund;
