"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_sled_1 = require("alaska-sled");
const Order_1 = require("../models/Order");
const AcceptRefund_1 = require("./AcceptRefund");
class CheckRefundTimeout extends alaska_sled_1.Sled {
    async exec() {
        let records = await Order_1.default.find({
            state: 800,
            refundTimeout: {
                $lt: new Date()
            }
        }).limit(10).session(this.dbSession);
        if (!records.length)
            return;
        await AcceptRefund_1.default.run({ records }, { dbSession: this.dbSession });
    }
}
exports.default = CheckRefundTimeout;
