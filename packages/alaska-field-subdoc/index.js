"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
const mongoose = require("mongoose");
class SubdocField extends alaska_model_1.Field {
    initSchema() {
        const schema = this._schema;
        let { ref } = this;
        if (!ref)
            throw new Error('Invalid subdoc ref!');
        let refSchema = ref.schema;
        if (!refSchema) {
            refSchema = new mongoose.Schema({});
            schema.path(this.path, this.multi ? [refSchema] : refSchema);
            ref.post('register', () => {
                this.initSchema();
            });
            return;
        }
        schema.path(this.path, this.multi ? [refSchema] : refSchema);
    }
}
SubdocField.fieldName = 'Mixed';
SubdocField.plain = mongoose.Schema.Types.Embedded;
SubdocField.plainName = 'subdoc';
SubdocField.viewOptions = ['codeMirrorOptions', 'multi'];
SubdocField.defaultOptions = {
    filter: '',
    cell: '',
    view: 'SubdocFieldView',
};
exports.default = SubdocField;
