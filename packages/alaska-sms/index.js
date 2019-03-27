"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const alaska_1 = require("alaska");
class SmsService extends alaska_1.Service {
    constructor() {
        super(...arguments);
        this.driversOptions = [];
        this.driversMap = new Map();
    }
    preInit() {
        let drivers = this.config.get('drivers');
        if (!drivers || !Object.keys(drivers).length) {
            throw new Error('No sms driver found');
        }
        let driversOptions = this.driversOptions;
        let defaultDriver;
        let driversMap = this.driversMap;
        _.forEach(drivers, (options, key) => {
            let label = options.label || key;
            driversOptions.push({ label, value: key });
            let driver;
            if (_.isFunction(options.send)) {
                driver = options;
            }
            else {
                driver = this.createDriver(options);
            }
            driversMap.set(key, driver);
            if (!defaultDriver || options.default) {
                defaultDriver = driver;
            }
        });
        this.driversOptions = driversOptions;
        this.defaultDriver = defaultDriver;
        this.driversMap = driversMap;
        if (this._optionsPromiseCallback) {
            this._optionsPromiseCallback(driversOptions);
        }
    }
    getDriverOptionsAsync() {
        if (!this._optionsPromise) {
            this._optionsPromise = new Promise((resolve) => {
                if (this.driversOptions) {
                    resolve(this.driversOptions);
                }
                else {
                    this._optionsPromiseCallback = resolve;
                }
            });
        }
        return this._optionsPromise;
    }
}
exports.default = new SmsService({
    id: 'alaska-sms'
});
