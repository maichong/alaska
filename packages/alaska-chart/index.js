"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const alaska_1 = require("alaska");
const keys = require("./parsers/key");
const values = require("./parsers/value");
class ChartService extends alaska_1.Service {
    constructor(options) {
        super(options);
        this.keyParsers = new Map();
        this.valueParsers = new Map();
        _.forEach(keys, (fn, name) => {
            if (name[0] === '_')
                return;
            this.keyParsers.set(name, fn);
        });
        _.forEach(values, (fn, name) => {
            if (name[0] === '_')
                return;
            this.valueParsers.set(name, fn);
        });
        this.resolveConfig().then((config) => {
            _.forEach(config.get('keyParsers'), (fn, name) => {
                this.keyParsers.set(name, fn);
            });
            _.forEach(config.get('valueParsers'), (fn, name) => {
                this.valueParsers.set(name, fn);
            });
        });
    }
}
exports.default = new ChartService({
    id: 'alaska-chart'
});
