"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_sled_1 = require("alaska-sled");
const __1 = require("..");
class Refund extends alaska_sled_1.Sled {
    async exec(params) {
        if (this.result)
            return;
        let refund = params.refund;
        if (!refund) {
            this.service.error('Can not create any refund');
        }
        if (!__1.default.paymentPlugins.has(refund.type))
            __1.default.error('Unknown payment type');
        await __1.default.paymentPlugins.get(refund.type).refund(refund, params.payment);
        await refund.save({ session: this.dbSession });
        return refund;
    }
}
exports.default = Refund;
