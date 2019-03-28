"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const numeral = require("numeral");
const alaska_field_number_1 = require("alaska-field-number");
class MoneyField extends alaska_field_number_1.default {
    init() {
        const field = this;
        const currencyService = field._model.service.lookup('alaska-currency');
        if (!currencyService) {
            alaska_field_number_1.default.prototype.init.call(this);
            return;
        }
        field.underscoreMethod('format', function (format) {
            if (format) {
                return numeral(this.get(field.path)).format(format);
            }
            return this.get(field.path);
        });
        this._schema.pre('save', function (next) {
            const record = this;
            if (!record.isModified(field.path)) {
                next();
                return;
            }
            const value = record.get(field.path);
            let currencyField = field.currencyField || 'currency';
            let currencyId = record.get(currencyField) || field.currency;
            let precision = field.precision;
            let currency = currencyService.currencies.get(currencyId);
            if (currency) {
                precision = currency.precision;
            }
            if (typeof precision === 'number') {
                let newValue = _.round(value, precision);
                record.set(field.path, newValue);
            }
            next();
        });
    }
}
MoneyField.defaultOptions = {
    cell: 'NumberFieldCell',
    view: 'NumberFieldView',
    filter: 'NumberFieldFilter',
    format: '0,0.00',
    default: 0,
};
exports.default = MoneyField;
