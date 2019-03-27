"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
class Notice extends alaska_model_1.Model {
    preSave() {
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
    }
}
Notice.label = 'Notice';
Notice.icon = 'bullhorn';
Notice.defaultColumns = 'title top createdAt';
Notice.filterFields = 'top createdAt?range @search';
Notice.defaultSort = '-top -createdAt';
Notice.api = {
    paginate: 1,
    list: 1,
    show: 1,
};
Notice.fields = {
    title: {
        label: 'Title',
        type: String,
        required: true
    },
    top: {
        label: 'Top',
        type: Boolean,
        default: false
    },
    createdAt: {
        label: 'Created At',
        type: Date
    },
    content: {
        label: 'Content',
        type: 'html',
        default: ''
    }
};
exports.default = Notice;
