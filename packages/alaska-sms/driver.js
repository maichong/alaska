"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_1 = require("alaska");
class SmsDriver extends alaska_1.Driver {
    constructor() {
        super(...arguments);
        this.instanceOfSmsDriver = true;
    }
}
SmsDriver.classOfSmsDriver = true;
exports.default = SmsDriver;
