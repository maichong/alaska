"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Driver {
    constructor(options, service) {
        this.type = options.type;
        this.service = service;
        this.options = options;
        this.instanceOfDriver = true;
        this.recycled = options.recycled || false;
        this._driver = null;
        this.idle = null;
    }
    driver() {
        return this._driver;
    }
    free() {
        if (!this.recycled) {
            this.destroy();
        }
        else {
            this.idle = new Date();
        }
    }
    destroy() {
        this._driver = null;
    }
}
Driver.classOfDriver = true;
exports.default = Driver;
