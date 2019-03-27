"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_field_number_1 = require("alaska-field-number");
class VersionField extends alaska_field_number_1.default {
    init() {
        let field = this;
        let schema = this._schema;
        let model = this._model;
        if (!field.cache)
            throw new Error('Missing config [alaska-field-version.cache]');
        let cacheDriver = model.service.createDriver(field.cache);
        let key = field.key || `${model.modelName}.${field.path}`;
        schema.pre('save', function (next) {
            let record = this;
            cacheDriver.inc(key).then((f) => {
                record.set(field.path, f);
                next();
            }, (error) => {
                next(error);
            });
        });
    }
}
exports.default = VersionField;
