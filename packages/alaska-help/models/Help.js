"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
function defaultFilters(ctx) {
    if (ctx.service.id === 'alaska-admin')
        return null;
    return {
        activated: true
    };
}
class Help extends alaska_model_1.Model {
    preSave() {
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
    }
}
Help.label = 'Help';
Help.icon = 'info-circle';
Help.defaultColumns = 'title parent sort activated createdAt';
Help.defaultSort = '-sort';
Help.searchFields = 'title content';
Help.defaultFilters = defaultFilters;
Help.groups = {
    content: {
        title: 'Content',
        panel: true
    }
};
Help.fields = {
    title: {
        label: 'Title',
        type: String,
        required: true
    },
    parent: {
        label: 'Parent Help',
        type: 'relationship',
        ref: 'Help'
    },
    relations: {
        label: 'Related Helps',
        type: 'relationship',
        ref: 'Help',
        multi: true
    },
    sort: {
        label: 'Sort',
        type: Number,
        protected: true,
        default: 0
    },
    activated: {
        label: 'Activated',
        protected: true,
        type: Boolean
    },
    createdAt: {
        label: 'Created At',
        type: Date
    },
    content: {
        label: 'Content',
        type: 'html',
        default: '',
        group: 'content'
    }
};
exports.default = Help;
