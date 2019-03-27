"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const alaska_1 = require("alaska");
const driver_1 = require("./driver");
exports.EmailDriver = driver_1.default;
const Email_1 = require("./models/Email");
class EmailService extends alaska_1.Service {
    constructor() {
        super(...arguments);
        this.drivers = new Map();
    }
    preInit() {
        let drivers = this.config.get('drivers');
        if (_.isEmpty(drivers)) {
            throw new Error('Missing config [alaska-email:drivers]');
        }
        let driversOptions = [];
        _.forEach(drivers, (config, key) => {
            let label = config.label || key;
            driversOptions.push({ label, value: key });
            let driver = this.createDriver(config);
            this.drivers.set(key, driver);
        });
        Email_1.default.fields.driver.options = driversOptions;
    }
}
exports.default = new EmailService({
    id: 'alaska-email'
});
