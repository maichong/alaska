"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_sled_1 = require("alaska-sled");
const __1 = require("..");
class Create extends alaska_sled_1.Sled {
    async exec(params) {
        if (this.result)
            return;
        let payment = params.payment;
        if (!payment) {
            __1.default.error('Can not create any payment');
        }
        if (!__1.default.payments.has(payment.type))
            __1.default.error('Unknown payment type');
        if (!payment.ip && params.ip) {
            payment.ip = params.ip;
        }
        if (payment.ip === '::1') {
            payment.ip = '127.0.0.1';
        }
        payment.$session(this.dbSession);
        await payment.save({ session: this.dbSession });
        payment.params = await __1.default.payments.get(payment.type).createParams(payment);
        await payment.save({ session: this.dbSession });
        return payment;
    }
}
exports.default = Create;
