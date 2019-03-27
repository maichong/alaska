"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Plugin {
    constructor(service) {
        this.service = service;
        this.instanceOfPlugin = true;
    }
}
Plugin.classOfPlugin = true;
exports.default = Plugin;
