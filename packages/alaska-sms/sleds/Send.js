"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const intl_messageformat_1 = require("intl-messageformat");
const alaska_sled_1 = require("alaska-sled");
const __1 = require("..");
const Sms_1 = require("../models/Sms");
const messageCache = {};
class Send extends alaska_sled_1.Sled {
    async exec(params) {
        let message = params.message;
        let driver = params.driver;
        let to = params.to;
        if (driver && typeof driver === 'string') {
            driver = __1.default.driversMap[driver];
        }
        if (driver && to && message) {
            return await driver.send(to, message);
        }
        let sms;
        if (params.sms && typeof params.sms === 'string') {
            sms = await Sms_1.default.findById(params.sms);
        }
        else {
            sms = params.sms || null;
        }
        if (!message) {
            if (!sms)
                throw new Error('Can not find sms template');
            message = sms.content;
        }
        if (!driver) {
            if (sms && sms.driver) {
                driver = __1.default.driversMap.get(sms.driver);
            }
            if (!driver) {
                driver = __1.default.defaultDriver;
            }
        }
        let values = params.values;
        if (values) {
            if (!messageCache[message]) {
                messageCache[message] = new intl_messageformat_1.default(message, '');
            }
            message = messageCache[message].format(values);
        }
        if (!driver)
            throw new Error('Can not resolve sms driver!');
        return await driver.send(to, message);
    }
}
exports.default = Send;
