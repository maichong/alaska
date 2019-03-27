"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_1 = require("alaska");
class EmailDriver extends alaska_1.Driver {
    constructor() {
        super(...arguments);
        this.instanceOfEmailDriver = true;
    }
}
EmailDriver.classOfEmailDriver = true;
exports.default = EmailDriver;
