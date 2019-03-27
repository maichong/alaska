"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
class UserEmail extends alaska_model_1.Model {
    preSave() {
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
    }
}
UserEmail.label = 'User Email';
UserEmail.icon = '';
UserEmail.defaultColumns = 'title sort createdAt';
UserEmail.defaultSort = '-sort';
UserEmail.api = {
    list: 2,
    create: 2,
    remove: 2,
};
UserEmail.fields = {
    email: {
        label: 'Email',
        type: String,
        index: true,
        required: true,
        unique: true
    },
    user: {
        label: 'User',
        type: 'relationship',
        ref: 'alaska-user.User',
        required: true,
        index: true
    },
    createdAt: {
        label: 'Created At',
        type: Date
    }
};
exports.default = UserEmail;
