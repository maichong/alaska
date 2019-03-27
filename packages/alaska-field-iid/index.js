"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_field_number_1 = require("alaska-field-number");
class IIDField extends alaska_field_number_1.default {
    init() {
        let field = this;
        let schema = this._schema;
        let model = this._model;
        let service = model.service;
        this.underscoreMethod('format', function (format) {
            if (format) {
                return numeral(this.get(field.path)).format(format);
            }
            return this.get(field.path);
        });
        if (!field.cache)
            throw new Error(`Missing iid field cache config`);
        let cacheDriver = service.createDriver(field.cache);
        let key = field.key || `${model.modelName}.${field.path}`;
        schema.pre('save', function (next) {
            let record = this;
            let value = record.get(field.path);
            if (value) {
                next();
                return;
            }
            cacheDriver.inc(key).then((f) => {
                record.set(field.path, f);
                next();
            }, (error) => {
                next(error);
            });
        });
    }
}
IIDField.fieldName = 'iid';
IIDField.defaultOptions = {
    cell: 'NumberFieldCell',
    view: 'IIDFieldView',
    filter: 'NumberFieldFilter',
};
exports.default = IIDField;
