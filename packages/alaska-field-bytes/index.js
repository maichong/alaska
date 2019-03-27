"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_field_number_1 = require("alaska-field-number");
class BytesField extends alaska_field_number_1.default {
}
BytesField.plain = Number;
BytesField.options = ['min', 'max'];
BytesField.viewOptions = ['min', 'max', 'unit', 'size', 'precision'];
BytesField.defaultOptions = {
    view: 'BytesFieldView',
    cell: 'BytesFieldCell',
    filter: 'NumberFieldFilter',
    unit: 'B',
    precision: 2,
    size: 1024
};
exports.default = BytesField;
