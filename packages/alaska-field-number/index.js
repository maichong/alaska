"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
const _ = require("lodash");
const numeral = require("numeral");
class NumberField extends alaska_model_1.Field {
    init() {
        let field = this;
        field.set = function (value) {
            if (typeof field.precision === 'number') {
                return _.round(value, field.precision);
            }
            return value;
        };
        this.underscoreMethod('format', function (format) {
            if (format) {
                return numeral(this.get(field.path)).format(format);
            }
            return this.get(field.path);
        });
    }
    parse(value) {
        if (value === null || typeof value === 'undefined') {
            return null;
        }
        value = parseFloat(value);
        return Number.isNaN(value) ? null : value;
    }
}
NumberField.fieldName = 'Number';
NumberField.plain = Number;
NumberField.dbOptions = ['min', 'max'];
NumberField.viewOptions = ['min', 'max', 'format', 'addonBefore', 'addonAfter', 'placeholder'];
NumberField.defaultOptions = {
    cell: 'NumberFieldCell',
    view: 'NumberFieldView',
    filter: 'NumberFieldFilter',
    format: '0,0'
};
exports.default = NumberField;
