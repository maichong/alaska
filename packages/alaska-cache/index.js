"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_1 = require("alaska");
class CacheDriver extends alaska_1.Driver {
    constructor() {
        super(...arguments);
        this.instanceOfCacheDriver = true;
    }
}
CacheDriver.classOfCacheDriver = true;
exports.default = CacheDriver;
