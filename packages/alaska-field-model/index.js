"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_field_select_1 = require("alaska-field-select");
class ModelField extends alaska_field_select_1.default {
}
ModelField.fieldName = 'Model';
ModelField.plain = String;
ModelField.viewOptions = ['checkbox', 'switch', 'multi'];
ModelField.defaultOptions = {
    cell: '',
    view: 'ModelFieldView',
    filter: ''
};
exports.default = ModelField;
