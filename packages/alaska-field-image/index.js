"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
class ImageField extends alaska_model_1.Field {
    initSchema() {
        const field = this;
        const schema = this._schema;
        const defaultValue = field.default || {};
        const imageService = field._model.service.lookup('alaska-image');
        if (imageService) {
            let driver = field.driver || 'default';
            if (!imageService.drivers.hasOwnProperty(driver))
                throw new Error('Image storage driver not found!');
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
        addPath('thumbUrl', String);
        addPath('name', String);
        addPath('size', Number);
        addPath('width', Number);
        addPath('height', Number);
        let imageSchema = new mongoose.Schema(paths);
        function stringToImage(value) {
            let matchs = String(value).match(/([a-f0-9]{24})/);
            let id = matchs ? matchs[1] : null;
            return { _id: new ObjectId(id), url: value };
        }
        if (field.multi) {
            schema.add({
                [field.path]: {
                    type: [imageSchema],
                    set(value) {
                        if (typeof value === 'string') {
                            return [stringToImage(value)];
                        }
                        if (Array.isArray(value)) {
                            return value.map((img) => {
                                if (typeof img === 'string') {
                                    return stringToImage(img);
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
                    type: imageSchema,
                    set(value) {
                        if (Array.isArray(value)) {
                            value = value[0] || null;
                        }
                        if (typeof value === 'string') {
                            value = stringToImage(value);
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
        if (imageService) {
            imageSchema.pre('validate', async function (next) {
                let doc = this;
                if (!doc._id || !doc.url || doc.name || doc.thumbUrl) {
                    next();
                    return;
                }
                let img = await imageService.getImage(doc._id);
                if (img && img.url === doc.url) {
                    doc.set(img.toObject());
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
ImageField.fieldName = 'Image';
ImageField.plainName = 'mixed';
ImageField.plain = mongoose.Schema.Types.Mixed;
ImageField.viewOptions = ['multi', 'max', (options, field) => {
        if (options.disabled === true)
            return;
        let service = field._model.service;
        let imageService = service.lookup('alaska-image');
        if (imageService) {
            let driver = field.driver || 'default';
            let driverConfig = imageService.drivers[driver];
            if (driverConfig) {
                options.allowed = driverConfig.allowed;
                options.maxSize = driverConfig.maxSize;
                options.thumbSuffix = driverConfig.thumbSuffix;
                options.driver = driver;
                return;
            }
        }
        options.disabled = true;
        return;
    }];
ImageField.defaultOptions = {
    max: 1000,
    cell: 'ImageFieldCell',
    view: 'ImageFieldView'
};
exports.default = ImageField;
