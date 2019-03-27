"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_1 = require("alaska");
class QueueDriver extends alaska_1.Driver {
    constructor() {
        super(...arguments);
        this.instanceOfQueueDriver = true;
    }
}
QueueDriver.classOfQueueDriver = true;
exports.default = QueueDriver;
