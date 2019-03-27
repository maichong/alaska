"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_field_image_1 = require("alaska-field-image");
class ImageLinkField extends alaska_field_image_1.default {
    initSchema() {
        const field = this;
        const schema = this._schema;
        if (this.multi) {
            this.plain = Array;
            this.plainName = 'array';
        }
        else {
            this.plain = String;
            this.plainName = 'string';
        }
        let main = field._model.service.main;
        let imageService = main.allServices.get('alaska-image');
        if (imageService) {
            let driver = field.driver || 'default';
            if (!imageService.drivers.hasOwnProperty(driver))
                throw new Error('Image storage driver not found!');
        }
        let options = {
            type: this.plain
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
        schema.path(this.path, options);
    }
}
ImageLinkField.plain = String;
ImageLinkField.plainName = 'string';
exports.default = ImageLinkField;
