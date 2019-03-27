"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_1 = require("alaska");
class LockDriver extends alaska_1.Driver {
    constructor() {
        super(...arguments);
        this.instanceOfLockDriver = true;
        this.locked = false;
    }
}
LockDriver.classOfLockDriver = true;
exports.default = LockDriver;
