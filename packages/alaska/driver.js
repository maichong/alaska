"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Driver {
    constructor(config, service) {
        this.type = config.type;
        this.service = service;
        this.config = config;
        this.instanceOfDriver = true;
        this.recycled = config.recycled || false;
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
