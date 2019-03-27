"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_payment_1 = require("alaska-payment");
const Payment_1 = require("alaska-payment/models/Payment");
const alaska_sled_1 = require("alaska-sled");
function default_1(router) {
    router.all('/alipay', async (ctx) => {
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
        let success = await alaska_payment_1.default.plugins.get('alipay').verify(body, payment);
        if (!success)
            return;
        payment.alipay_trade_no = body.trade_no;
        payment.alipay_buyer_email = body.buyer_email;
        try {
            let sledId = `${alaska_payment_1.default.id}.Complete`;
            const Complete = alaska_sled_1.Sled.lookup(sledId) || alaska_payment_1.default.error('Complete sled not found!');
            await Complete.run({ payment }, { dbSession: this.dbSession });
            ctx.body = 'OK';
            ctx.status = 200;
        }
        catch (error) {
            console.error(error.stack);
            ctx.status = 500;
            ctx.body = 'ERR';
        }
    });
}
exports.default = default_1;
