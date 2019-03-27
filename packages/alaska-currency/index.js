"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_1 = require("alaska");
const Currency_1 = require("./models/Currency");
class CurrencyService extends alaska_1.Service {
    constructor() {
        super(...arguments);
        this.currencies = new Map();
    }
    get defaultCurrency() {
        if (!this._currency)
            throw new Error('Default currency not initialized!');
        return this._currency;
    }
    get defaultCurrencyId() {
        if (!this._currency)
            throw new Error('Default currency not initialized!');
        return this._currency.id;
    }
    postInit() {
        Currency_1.default.find().then((list) => {
            list.forEach((record) => {
                this.currencies.set(record.id, record);
                if (record.isDefault) {
                    this._currency = record;
                }
            });
        });
        Currency_1.default.getWatcher().on('change', (record) => {
            this.currencies.set(record.id, record);
            if (record.isDefault) {
                this._currency = record;
            }
        });
    }
}
exports.default = new CurrencyService({
    id: 'alaska-currency'
});
