"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
class Image extends alaska_model_1.Model {
    preSave() {
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
    }
}
Image.label = 'Image';
Image.icon = 'picture-o';
Image.defaultColumns = 'thumbUrl user name size width height createdAt';
Image.defaultSort = '-_id';
Image.nocreate = true;
Image.noupdate = true;
Image.actions = {
    create: {
        sled: 'alaska-image.Create'
    }
};
Image.api = {
    paginate: 2,
    list: 2,
    count: 2,
    create: 2
};
Image.fields = {
    user: {
        label: 'User',
        type: 'relationship',
        ref: 'alaska-user.User',
        optional: 'alaska-user'
    },
    name: {
        label: 'Name',
        type: String
    },
    ext: {
        label: 'Extension',
        type: String
    },
    path: {
        label: 'Path',
        type: String
    },
    thumbUrl: {
        label: 'Thumb',
        type: String,
        cell: 'ImageFieldCell',
        view: 'ImageFieldView'
    },
    url: {
        label: 'URL',
        type: String
    },
    size: {
        label: 'Size',
        type: Number,
        default: 0
    },
    width: {
        label: 'Width',
        type: Number
    },
    height: {
        label: 'Height',
        type: Number
    },
    createdAt: {
        label: 'Created At',
        type: Date
    }
};
exports.default = Image;
