"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_1 = require("alaska");
const Payment_1 = require("alaska-payment/models/Payment");
const Recharge_1 = require("./models/Recharge");
class RechargeService extends alaska_1.Service {
    postInit() {
        Recharge_1.default._fields.type.options = Recharge_1.default._fields.type.options.concat(Payment_1.default.fields.type.options);
    }
}
exports.default = new RechargeService({
    id: 'alaska-recharge'
});
