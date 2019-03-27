"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
const mongoose = require("mongoose");
class MixedField extends alaska_model_1.Field {
}
MixedField.fieldName = 'Mixed';
MixedField.plain = mongoose.Schema.Types.Mixed;
MixedField.plainName = 'mixed';
MixedField.viewOptions = ['codeMirrorOptions'];
MixedField.defaultOptions = {
    cell: 'MixedFieldCell',
    view: 'MixedFieldView',
};
exports.default = MixedField;
