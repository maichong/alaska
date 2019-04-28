"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
class FileField extends alaska_model_1.Field {
    initSchema() {
        const field = this;
        const schema = this._schema;
        const defaultValue = field.default || {};
        const fileService = field._model.service.lookup('alaska-file');
        if (fileService) {
            let driver = field.driver || 'default';
            if (!fileService.drivers.hasOwnProperty(driver))
                throw new Error('File storage driver not found!');
        }
        const paths = {};
        function addPath(mPath, type) {
            const options = { type, default: null };
            if (typeof defaultValue[mPath] !== 'undefined') {
                options.default = defaultValue[mPath];
            }
            paths[mPath] = options;
        }
        addPath('_id', mongoose.SchemaTypes.ObjectId);
        addPath('user', mongoose.SchemaTypes.ObjectId);
        addPath('ext', String);
        addPath('path', String);
        addPath('url', String);
        addPath('name', String);
        addPath('size', Number);
        let fileSchema = new mongoose.Schema(paths);
        function stringToFile(value) {
            let matchs = String(value).match(/([a-f0-9]{24})/);
            let id = matchs ? matchs[1] : null;
            return { _id: new ObjectId(id), url: value };
        }
        if (field.multi) {
            schema.add({
                [field.path]: {
                    type: [fileSchema],
                    set(value) {
                        if (typeof value === 'string') {
                            return [stringToFile(value)];
                        }
                        if (Array.isArray(value)) {
                            return value.map((img) => {
                                if (typeof img === 'string') {
                                    return stringToFile(img);
                                }
                                return img;
                            });
                        }
                        return value;
                    }
                }
            });
        }
        else {
            schema.add({
                [field.path]: {
                    type: fileSchema,
                    set(value) {
                        if (Array.isArray(value)) {
                            value = value[0] || null;
                        }
                        if (typeof value === 'string') {
                            value = stringToFile(value);
                        }
                        if (value && typeof value === 'object' && value._doc)
                            value = value._doc;
                        if (!this[field.path])
                            return value;
                        this[field.path].set(value);
                        return this[field.path];
                    }
                }
            }, '');
        }
        if (fileService) {
            fileSchema.pre('validate', async function (next) {
                let doc = this;
                if (!doc._id || !doc.url || doc.name) {
                    next();
                    return;
                }
                let file = await fileService.getFile(doc._id);
                if (file && file.url === doc.url) {
                    doc.set(file.toObject());
                }
                next();
            });
        }
        this.underscoreMethod('data', function () {
            const value = this.get(field.path);
            if (!field.multi) {
                return value && value.url ? value.url : '';
            }
            return (value || []).map((v) => (v && v.url ? v.url : '')).filter((v) => v);
        });
    }
}
FileField.fieldName = 'File';
FileField.plainName = 'mixed';
FileField.plain = mongoose.Schema.Types.Mixed;
FileField.viewOptions = ['multi', 'max', (options, field) => {
        if (options.disabled === true)
            return;
        let service = field._model.service;
        let fileService = service.lookup('alaska-file');
        if (fileService) {
            let driver = field.driver || 'default';
            let driverConfig = fileService.drivers[driver];
            if (driverConfig) {
                options.allowed = driverConfig.allowed;
                options.maxSize = driverConfig.maxSize;
                options.driver = driver;
                return;
            }
        }
        options.disabled = true;
        return;
    }];
FileField.defaultOptions = {
    max: 1000,
    cell: 'FileFieldCell',
    view: 'FileFieldView'
};
exports.default = FileField;
