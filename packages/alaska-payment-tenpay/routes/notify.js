"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_payment_1 = require("alaska-payment");
const Payment_1 = require("alaska-payment/models/Payment");
const alaska_sled_1 = require("alaska-sled");
const raw = require("raw-body");
const utils = require("alaska-payment-tenpay/utils/utils");
function default_1(router) {
    router.all('/tenpay', async (ctx) => {
        ctx.set('Content-Type', 'text/xml');
        function replay(msg) {
            ctx.body = utils.buildXML(msg ? { return_code: 'FAIL', return_msg: msg } : { return_code: 'SUCCESS' });
        }
        try {
            let body = await raw(ctx.req);
            let data = await utils.parseXML(body);
            if (data.return_code !== 'SUCCESS' || data.result_code !== 'SUCCESS') {
                return replay('not success');
            }
            let paymentId = data.out_trade_no;
            let payment = (await Payment_1.default.findById(paymentId).session(this.dbSession));
            if (!payment) {
                return replay('out_trade_no error');
            }
            let success = await alaska_payment_1.default.plugins.get('tenpay').verify(data, payment);
            if (!success) {
                return replay('sign error');
            }
            if (payment.amount * 100 !== data.total_fee) {
                return replay('total_fee error');
            }
            payment.tenpay_transaction_id = data.transaction_id;
            let sledId = `${alaska_payment_1.default.id}.Complete`;
            const Complete = alaska_sled_1.Sled.lookup(sledId) || alaska_payment_1.default.error('Complete sled not found!');
            await Complete.run({ payment }, { dbSession: this.dbSession });
            ctx.body = 'OK';
            ctx.status = 200;
        }
        catch (err) {
            console.error(err.stack);
            ctx.status = 500;
            ctx.body = 'ERR';
        }
    });
}
exports.default = default_1;
