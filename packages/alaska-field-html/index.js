"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_field_text_1 = require("alaska-field-text");
class HtmlField extends alaska_field_text_1.default {
}
HtmlField.fieldName = 'Html';
HtmlField.defaultOptions = {
    cell: 'HtmlFieldCell',
    view: 'HtmlFieldView',
    filter: 'TextFieldFilter',
};
exports.default = HtmlField;
