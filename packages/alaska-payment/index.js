"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_1 = require("alaska");
const plugin_1 = require("./plugin");
exports.PaymentPlugin = plugin_1.default;
class PaymentService extends alaska_1.Service {
    constructor() {
        super(...arguments);
        this.payments = new Map();
    }
}
exports.default = new PaymentService({
    id: 'alaska-payment'
});
