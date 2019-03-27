"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
const mongoose = require("mongoose");
class JsonField extends alaska_model_1.Field {
    init() {
        this.get = function (json) {
            if (!json)
                return null;
            return JSON.parse(json);
        };
        this.set = function (object) {
            return JSON.stringify(object);
        };
    }
}
JsonField.fieldName = 'Json';
JsonField.plain = mongoose.Schema.Types.String;
JsonField.plainName = 'json';
JsonField.viewOptions = ['codeMirrorOptions'];
JsonField.defaultOptions = {
    cell: 'MixedFieldCell',
    view: 'MixedFieldView',
};
exports.default = JsonField;
