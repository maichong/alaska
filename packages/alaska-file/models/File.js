"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
class File extends alaska_model_1.Model {
    preSave() {
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
    }
}
File.label = 'File';
File.icon = 'file-o';
File.defaultColumns = 'user name size createdAt';
File.defaultSort = '-_id';
File.nocreate = true;
File.noupdate = true;
File.actions = {
    create: {
        sled: 'alaska-file.Create'
    }
};
File.api = {
    paginate: 2,
    list: 2,
    count: 2,
    create: 2
};
File.fields = {
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
    url: {
        label: 'URL',
        type: String
    },
    size: {
        label: 'Size',
        type: Number,
        default: 0
    },
    createdAt: {
        label: 'Created At',
        type: Date
    }
};
exports.default = File;
