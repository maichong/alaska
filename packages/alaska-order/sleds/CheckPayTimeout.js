"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_sled_1 = require("alaska-sled");
const Order_1 = require("../models/Order");
const Timeout_1 = require("./Timeout");
class CheckPayTimeout extends alaska_sled_1.Sled {
    async exec() {
        let records = await Order_1.default.find({
            state: 200,
            paymentTimeout: {
                $lt: new Date()
            }
        }).limit(10).session(this.dbSession);
        if (!records.length)
            return;
        await Timeout_1.default.run({ records }, { dbSession: this.dbSession });
    }
}
exports.default = CheckPayTimeout;
