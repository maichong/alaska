"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_payment_1 = require("alaska-payment");
const Payment_1 = require("alaska-payment/models/Payment");
const Complete_1 = require("alaska-payment/sleds/Complete");
function default_1(router) {
    router.post('/notify/alipay', async (ctx) => {
        ctx.status = 400;
        ctx.body = 'ERR';
        if (ctx.method !== 'POST')
            return;
        let body = ctx.state.body || ctx.request.body;
        if (!body || body.trade_status !== 'TRADE_SUCCESS')
            return;
        let paymentId = body.out_trade_no;
        let payment = (await Payment_1.default.findById(paymentId).session(ctx.dbSession));
        if (!payment)
            return;
        if (payment.state !== 'pending')
            return;
        let plugin = alaska_payment_1.default.payments.get(payment.type);
        if (!await plugin.verify(body, payment))
            return;
        payment.callbackData = body;
        payment.alipay_trade_no = body.trade_no;
        payment.alipay_buyer_id = body.buyer_id;
        payment.alipay_buyer_logon_id = body.buyer_logon_id;
        await Complete_1.default.run({ record: payment }, { dbSession: ctx.dbSession });
        ctx.body = 'OK';
        ctx.status = 200;
    });
}
exports.default = default_1;
