"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const alaska_model_1 = require("alaska-model");
class SelectField extends alaska_model_1.Field {
    initSchema() {
        this.options = _.filter(this.options, (opt) => (!opt.optional || !!this._model.service.lookup(opt.optional)));
        let schema = this._schema;
        if (this.number) {
            this.plain = Number;
        }
        else if (this.boolean) {
            this.plain = Boolean;
        }
        else {
            this.plain = String;
        }
        let options = {
            type: this.plain
        };
        [
            'get',
            'set',
            'default',
            'index',
            'unique',
            'text',
            'sparse',
            'required',
            'select'
        ].forEach((key) => {
            if (typeof this[key] !== 'undefined') {
                options[key] = this[key];
            }
        });
        schema.path(this.path, this.multi ? [options] : options);
    }
    parse(value) {
        if (value === null || typeof value === 'undefined') {
            return null;
        }
        if (this.number) {
            value = parseInt(value);
            return Number.isNaN(value) ? null : value;
        }
        else if (this.boolean) {
            if (value === 'true') {
                value = true;
            }
            else if (value === 'false') {
                value = false;
            }
            if (value === true || value === false)
                return value;
        }
        else {
            return String(value);
        }
        return null;
    }
}
SelectField.fieldName = 'Select';
SelectField.plain = String;
SelectField.viewOptions = ['options', 'translate', 'checkbox', 'switch', 'multi'];
SelectField.defaultOptions = {
    cell: 'SelectFieldCell',
    view: 'SelectFieldView',
    filter: 'SelectFieldFilter'
};
exports.default = SelectField;
