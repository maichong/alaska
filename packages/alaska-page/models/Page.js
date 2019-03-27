"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
class Page extends alaska_model_1.Model {
    async preSave() {
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
        if (!this.seoTitle) {
            this.seoTitle = this.title;
        }
    }
}
Page.label = 'Page';
Page.icon = 'file-text';
Page.defaultColumns = '_id title createdAt';
Page.filterFields = 'createdAt?range @search';
Page.defaultSort = '-createdAt';
Page.searchFields = '_id title';
Page.api = {
    list: 1,
    paginate: 1,
    show: 1
};
Page.fields = {
    _id: {
        type: String,
        required: true
    },
    title: {
        label: 'Title',
        type: String,
        required: true
    },
    seoTitle: {
        label: 'SEO Title',
        type: String
    },
    seoKeywords: {
        label: 'SEO Keywords',
        type: String
    },
    seoDescription: {
        label: 'SEO Description',
        type: String
    },
    template: {
        label: 'Page Template',
        type: String
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
exports.default = Page;
