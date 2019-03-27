"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_1 = require("alaska");
class SubscribeDriver extends alaska_1.Driver {
    constructor() {
        super(...arguments);
        this.instanceOfSubscribeDriver = true;
    }
}
SubscribeDriver.classOfSubscribeDriver = true;
exports.default = SubscribeDriver;
