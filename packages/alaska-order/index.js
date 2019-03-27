"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_1 = require("alaska");
const CheckPayTimeout_1 = require("./sleds/CheckPayTimeout");
const CheckReceiveTimeout_1 = require("./sleds/CheckReceiveTimeout");
const CheckRefundTimeout_1 = require("./sleds/CheckRefundTimeout");
class OrderService extends alaska_1.Service {
    postStart() {
        this.checkPayTimer = setInterval(() => CheckPayTimeout_1.default.runWithTransaction(), 10000);
        this.checkReceiveTimer = setInterval(() => CheckReceiveTimeout_1.default.runWithTransaction(), 60000);
        this.checkRefundTimer = setInterval(() => CheckRefundTimeout_1.default.runWithTransaction(), 60000);
    }
}
exports.default = new OrderService({ id: 'alaska-order' });
