"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const utils = require("./utils");
class Config {
    constructor(service) {
        this.service = service;
        this.instanceOfConfig = true;
        this.values = _.cloneDeep(Config.defaultConfig);
    }
    static applyData(data, config) {
        utils.merge(data, config);
        return data;
    }
    get(key, defaultValue, mainAsDefault) {
        let value = _.get(this.values, key, defaultValue);
        if (mainAsDefault && !this.service.isMain() && (value === null || typeof value === 'undefined')) {
            value = this.service.main.config.get(key);
        }
        return value;
    }
    apply(config) {
        this.service.debug('apply config', config);
        Config.applyData(this.values, config);
    }
}
Config.classOfConfig = true;
Config.defaultConfig = {
    env: 'production',
    extensions: {},
    plugins: {},
    services: {},
    prefix: '',
    apiPrefix: '/api'
};
exports.default = Config;
