"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
class AppUpdate extends alaska_model_1.Model {
    preSave() {
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
    }
}
AppUpdate.titleField = 'key';
AppUpdate.icon = 'upload';
AppUpdate.fields = {
    key: {
        type: String,
        required: true,
        index: true
    },
    createdAt: {
        label: 'Created At',
        type: Date
    }
};
exports.default = AppUpdate;
