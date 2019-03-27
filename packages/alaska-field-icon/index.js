"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_field_text_1 = require("alaska-field-text");
class IconField extends alaska_field_text_1.default {
}
IconField.fieldName = 'Icon';
IconField.defaultOptions = {
    cell: 'IconFieldCell',
    view: 'IconFieldView',
    filter: 'TextFieldFilter',
};
exports.default = IconField;
