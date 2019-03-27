"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_field_text_1 = require("alaska-field-text");
class CodeField extends alaska_field_text_1.default {
}
CodeField.fieldName = 'Code';
CodeField.viewOptions = ['codeMirrorOptions'];
CodeField.defaultOptions = {
    cell: 'TextFieldCell',
    view: 'CodeFieldView',
    filter: 'TextFieldFilter'
};
exports.default = CodeField;
