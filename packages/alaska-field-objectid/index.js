"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
class ObjectIdField extends alaska_model_1.Field {
    parse(value) {
        if (ObjectId.isValid(value)) {
            if (typeof value === 'object') {
                return value;
            }
            return new ObjectId(value);
        }
        return null;
    }
}
ObjectIdField.fieldName = 'ObjectId';
ObjectIdField.plain = mongoose.Schema.Types.ObjectId;
ObjectIdField.plainName = 'objectid';
ObjectIdField.defaultOptions = {
    cell: 'TextFieldCell',
    view: 'TextFieldView',
    filter: false,
};
exports.default = ObjectIdField;
