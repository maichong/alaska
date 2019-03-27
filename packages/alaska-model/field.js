"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Field {
    constructor(options, schema, model) {
        this.instanceOfField = true;
        this._options = options;
        this._schema = schema;
        this._model = model;
        let FieldClass = options.type;
        this.type = FieldClass;
        if (FieldClass.defaultOptions) {
            Object.assign(this, FieldClass.defaultOptions);
        }
        let dbOptions = [
            'get',
            'set',
            'default',
            'index',
            'unique',
            'text',
            'sparse',
            'required',
            'select'
        ].concat(FieldClass.dbOptions || []);
        Object.keys(options).forEach((key) => {
            let value = options[key];
            if (value && value instanceof Promise) {
                value.then((v) => {
                    this[key] = v;
                    if (dbOptions.indexOf(key) > -1) {
                        this.initSchema();
                    }
                });
            }
            else {
                this[key] = value;
            }
        });
        this.init();
    }
    initSchema() {
        let schema = this._schema;
        let options = {
            type: this.plain || this.constructor.plain
        };
        let keys = [
            'get',
            'set',
            'default',
            'index',
            'unique',
            'text',
            'sparse',
            'required',
            'select'
        ].concat(this.type.dbOptions || []);
        keys.forEach((key) => {
            if (typeof this[key] !== 'undefined') {
                options[key] = this[key];
            }
        });
        schema.path(this.path, options);
    }
    underscoreMethod(name, fn) {
        this._model.underscoreMethod(this.path, name, fn);
    }
    viewOptions() {
        let field = this;
        let FieldClass = this.type;
        let plainName = field.plainName || FieldClass.plainName;
        if (!plainName) {
            if (field.plain === String || FieldClass.plain === String) {
                plainName = 'string';
            }
            else if (field.plain === Date || FieldClass.plain === Date) {
                plainName = 'date';
            }
            else if (field.plain === Number || FieldClass.plain === Number) {
                plainName = 'number';
            }
            else if (field.plain === Boolean || FieldClass.plain === Boolean) {
                plainName = 'bool';
            }
            else {
                plainName = '';
            }
        }
        let options = {
            label: field.label,
            path: field.path,
            plainName,
            default: field.default,
            super: field.super,
            hidden: field.hidden,
            protected: field.protected,
            disabled: field.disabled,
            group: field.group,
            fixed: field.fixed,
            help: field.help,
            required: field.required,
            horizontal: field.horizontal,
            nolabel: field.nolabel,
            cell: field.cell,
            view: field.view,
            filter: field.filter,
            after: field.after,
            filters: field.filters,
        };
        if (FieldClass.viewOptions && FieldClass.viewOptions.length) {
            FieldClass.viewOptions.forEach((key) => {
                if (typeof key === 'function') {
                    key(options, field);
                }
                else if (typeof key === 'object' && key.key) {
                    options[key.key] = key.value;
                }
                else if (typeof field[key] !== 'undefined') {
                    options[key] = field[key];
                }
            });
        }
        return options;
    }
    init() {
    }
    parseFilter(value) {
        return this.parse(value);
    }
    parse(value) {
        return value;
    }
}
Field.classOfField = true;
Field.plain = String;
exports.default = Field;
