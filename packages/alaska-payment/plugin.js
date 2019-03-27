"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_1 = require("alaska");
class PaymentPlugin extends alaska_1.Plugin {
    constructor() {
        super(...arguments);
        this.instanceOfPaymentPlugin = true;
        this.currencies = new Set();
    }
}
PaymentPlugin.classOfPaymentPlugin = true;
exports.default = PaymentPlugin;
