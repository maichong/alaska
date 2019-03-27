"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
class Keyword extends alaska_model_1.Model {
    preSave() {
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
    }
}
Keyword.label = 'Keyword';
Keyword.icon = 'search';
Keyword.defaultColumns = 'title hot createdAt';
Keyword.defaultSort = '-hot';
Keyword.listLimit = 10;
Keyword.api = {
    list: 1
};
Keyword.fields = {
    title: {
        label: 'Keyword',
        type: String,
        unique: true,
        required: true
    },
    hot: {
        label: 'Hot',
        type: Number,
        default: 0
    },
    createdAt: {
        label: 'Created At',
        type: Date
    }
};
exports.default = Keyword;
