"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const moment = require("moment");
const alaska_sled_1 = require("alaska-sled");
const alaska_settings_1 = require("alaska-settings");
const __1 = require("..");
const OrderGoods_1 = require("../models/OrderGoods");
class Refund extends alaska_sled_1.Sled {
    async exec(params) {
        if (this.result)
            return this.result;
        let order = params.record;
        if (!order)
            throw new Error('record is required');
        if (![400, 500, 600, 800].includes(order.state))
            __1.default.error('Order state error');
        let refundExpressCode = params.expressCode || _.get(params, 'body.refundExpressCode') || '';
        let refundReason = params.reason || _.get(params, 'body.refundReason') || '';
        let refundQuantity = Number(params.quantity || _.get(params, 'body.refundQuantity') || 0);
        if (Number.isNaN(refundQuantity) || refundQuantity < 0 || refundQuantity !== _.round(refundQuantity))
            __1.default.error('invalid quantity');
        let refundAmount = Number(params.amount || _.get(params, 'body.refundAmount') || 0);
        if (order.payed !== 0 && refundAmount === 0) {
            __1.default.error('refund amount is required');
        }
        let precision = 2;
        let currencyService = __1.default.lookup('alaska-currency');
        if (currencyService) {
            let currency = currencyService.currencies.get(order.currency) || currencyService.defaultCurrency;
            precision = currency.precision;
        }
        if (Number.isNaN(refundAmount) || refundAmount < 0 || refundAmount !== _.round(refundAmount, precision))
            __1.default.error('invalid amount');
        if (refundAmount + (order.refundAmount || 0) + (order.refundedAmount || 0) > order.payed)
            __1.default.error('refund amount can not greater than payed amount');
        if (params.orderGoods) {
            let goods = await OrderGoods_1.default.findById(params.orderGoods).where({
                order: order._id
            }).session(this.dbSession);
            if (!goods)
                __1.default.error('Order goods not found');
            if (goods.refundAmount)
                __1.default.error('The goods of the order already applied refund');
            goods.refundExpressCode = refundExpressCode;
            goods.refundReason = refundReason;
            goods.refundAmount = refundAmount;
            goods.refundQuantity = refundQuantity;
            await goods.save({ session: this.dbSession });
        }
        if (!order.refundTimeout) {
            let refundTimeout = await alaska_settings_1.default.get('order.refundTimeout');
            if (refundTimeout) {
                order.refundTimeout = moment().add(refundTimeout, 's').toDate();
            }
        }
        order.refundExpressCode = refundExpressCode;
        order.refundReason = refundReason;
        order.refundAmount = refundAmount + (order.refundAmount || 0);
        order.refundQuantity = refundQuantity + (order.refundQuantity || 0);
        order.state = 800;
        await order.save({ session: this.dbSession });
        order.createLog('Apply refund', this.dbSession);
        return order;
    }
}
exports.default = Refund;
