"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
const mongoose = require("mongoose");
const TypeObjectId = mongoose.Schema.Types.ObjectId;
const { ObjectId } = mongoose.Types;
class RelationshipField extends alaska_model_1.Field {
    static watchDefault(ref, defaultField) {
        let watcher = this._defaultsWatcher.get(ref.id);
        if (!watcher) {
            watcher = ref.getWatcher({ [defaultField]: true });
            ref.findOne().sort(`-${defaultField}`).then((record) => {
                if (record) {
                    watcher.emit('change', record);
                    RelationshipField._defaults.set(ref.id, record);
                }
            });
        }
        return { record: this._defaults.get(ref.id), watcher };
    }
    initSchema() {
        const field = this;
        const schema = field._schema;
        const model = field._model;
        const service = model.service;
        const main = service.main;
        let { plain, ref } = this;
        if (typeof ref === 'string') {
            ref = model.lookup(ref);
            if (!ref) {
                throw new Error(`${model.id}.fields.${field.path}.ref not found [${field.ref}]`);
            }
        }
        let options = {};
        let type;
        if (plain) {
            type = plain;
        }
        else if (ref.fields._id) {
            let idField = ref.fields._id;
            let idType = idField.type;
            if (idField.plain) {
                type = idField.plain;
            }
            else if (idType) {
                if (typeof idType === 'string') {
                    let fieldLib = `alaska-field-${idType}`;
                    let idFieldClass = main.modules.libraries[fieldLib];
                    if (!idFieldClass) {
                        throw new Error(`Field type '${fieldLib}' not found!`);
                    }
                    type = idFieldClass.plain;
                    if (idFieldClass.plainName) {
                        field.plainName = idFieldClass.plainName;
                    }
                }
                else if (idType instanceof alaska_model_1.Field) {
                    type = idType.plain;
                    if (idType.plainName) {
                        field.plainName = idType.plainName;
                    }
                }
                else {
                    type = idType;
                }
            }
        }
        if (!type) {
            type = TypeObjectId;
        }
        options = {
            type,
            ref: ref.modelName
        };
        field.model = ref.id;
        if (type === TypeObjectId && !field.plainName) {
            field.plainName = 'objectid';
        }
        options.set = (value) => {
            if (value === '' && type === TypeObjectId) {
                return undefined;
            }
            return value;
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
        if (!options.default && field.defaultField) {
            options.default = function () {
                return RelationshipField._defaults.get(field.model);
            };
            let { record, watcher } = RelationshipField.watchDefault(ref, field.defaultField);
            if (record) {
                field.default = record._id;
            }
            watcher.on('change', (d) => {
                field.default = d._id;
            });
        }
        field.ref = ref;
        field.plain = type;
        schema.path(field.path, field.multi ? [options] : options);
    }
    parse(value) {
        if (value === null || typeof value === 'undefined') {
            return null;
        }
        if (this.plain === TypeObjectId) {
            if (ObjectId.isValid(value)) {
                if (typeof value === 'object') {
                    return value;
                }
                return new ObjectId(value);
            }
        }
        else if (this.plain === String) {
            return String(value);
        }
        else if (this.plain === Number) {
            return parseInt(value) || null;
        }
        else if (this.plain === Boolean) {
            if (value === 'true') {
                value = true;
            }
            else if (value === 'false') {
                value = false;
            }
            if (value === true || value === false)
                return value;
        }
        return null;
    }
}
RelationshipField.fieldName = 'Relationship';
RelationshipField.plain = TypeObjectId;
RelationshipField.viewOptions = [
    'multi', 'checkbox', 'switch',
    (options, field) => {
        let ref = field.ref;
        if (ref && ref instanceof alaska_model_1.Model) {
            options.ref = ref.id;
            options.title = ref.titleField;
        }
    }
];
RelationshipField.defaultOptions = {
    cell: 'RelationshipFieldCell',
    view: 'RelationshipFieldView',
    filter: 'RelationshipFieldFilter',
};
RelationshipField._defaults = new Map();
RelationshipField._defaultsWatcher = new Map();
exports.default = RelationshipField;
