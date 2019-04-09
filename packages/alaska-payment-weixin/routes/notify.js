"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const alaska_payment_1 = require("alaska-payment");
const Payment_1 = require("alaska-payment/models/Payment");
const Complete_1 = require("alaska-payment/sleds/Complete");
const raw = require("raw-body");
const utils_1 = require("../utils");
function default_1(router) {
    router.post('/notify/weixin', async (ctx) => {
        ctx.set('Content-Type', 'text/xml');
        function failed(msg) {
            ctx.body = utils_1.data2xml({ return_code: 'FAIL', return_msg: msg });
        }
        try {
            let body = await raw(ctx.req);
            let data = await utils_1.xml2data(body);
            if (data.return_code !== 'SUCCESS' || data.result_code !== 'SUCCESS') {
                return failed('not success');
            }
            let paymentId = data.out_trade_no;
            let payment = await Payment_1.default.findById(paymentId).session(ctx.dbSession);
            if (!payment)
                return failed('out_trade_no error');
            if (payment.state !== 'pending')
                return failed('invalid state');
            let plugin = alaska_payment_1.default.paymentPlugins.get(payment.type);
            if (!await plugin.verify(data, payment))
                return failed('sign error');
            if (_.round(payment.amount * 100) !== parseInt(data.total_fee))
                return failed('total_fee error');
            payment.callbackData = data;
            payment.weixinTransactionId = data.transaction_id;
            await Complete_1.default.run({ record: payment }, { dbSession: ctx.dbSession });
            ctx.body = utils_1.data2xml({ return_code: 'SUCCESS', return_msg: 'OK' });
        }
        catch (err) {
            console.error(err.stack);
            failed('ERR');
            ctx.status = 500;
        }
    });
}
exports.default = default_1;
