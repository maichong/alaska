"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Plugin {
    constructor(config, service) {
        this.instanceOfPlugin = true;
        this.service = service;
        this.config = config;
    }
}
Plugin.classOfPlugin = true;
exports.default = Plugin;
