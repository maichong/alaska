"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
class TextFeild extends alaska_model_1.Field {
    init() {
        if (this.match && !(this.match instanceof RegExp)) {
            throw new Error(`${this._model.modelName}.${this.path} field "match" option must be instance of RegExp`);
        }
    }
    parse(value) {
        if (typeof value === 'string') {
            return value;
        }
        else if (value === null || typeof value === 'undefined') {
            return null;
        }
        return String(value);
    }
}
TextFeild.fieldName = 'Text';
TextFeild.plain = String;
TextFeild.dbOptions = ['trim', 'match', 'lowercase', 'uppercase', 'maxlength', 'minlength'];
TextFeild.viewOptions = [
    'trim', 'match', 'lowercase', 'uppercase', 'maxlength', 'minlength',
    'addonBefore', 'addonAfter', 'placeholder', 'multiLine', 'translate',
    function (options, field) {
        if (field.match) {
            options.match = field.match.toString();
        }
    }
];
TextFeild.defaultOptions = {
    cell: 'TextFieldCell',
    view: 'TextFieldView',
    filter: 'TextFieldFilter',
};
exports.default = TextFeild;
