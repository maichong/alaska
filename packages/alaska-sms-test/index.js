"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const driver_1 = require("alaska-sms/driver");
class SmsTestDriver extends driver_1.default {
    send(to, message) {
        console.log('send sms to', to, ':', message);
        return Promise.resolve({});
    }
}
exports.default = SmsTestDriver;
