"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
function defaultFilters(ctx) {
    if (ctx.state.superMode)
        return null;
    return {
        super: { $ne: true }
    };
}
class AdminMenu extends alaska_model_1.Model {
    async preSave() {
        if (this.parent && this.parent === this._id) {
            throw new Error('Parent can not be self');
        }
    }
}
AdminMenu.label = 'Admin Menu';
AdminMenu.icon = 'bars';
AdminMenu.titleField = 'label';
AdminMenu.defaultColumns = 'icon label type nav parent sort service link ability super activated';
AdminMenu.filterFields = 'type?switch&nolabel @parent @search';
AdminMenu.defaultSort = '-sort';
AdminMenu.searchFields = '_id label link parent';
AdminMenu.defaultFilters = defaultFilters;
AdminMenu.fields = {
    _id: {
        type: String
    },
    label: {
        label: 'Title',
        type: String,
        required: true
    },
    icon: {
        label: 'Icon',
        type: 'icon',
        default: ''
    },
    type: {
        label: 'Type',
        type: 'select',
        default: 'link',
        switch: true,
        options: [{
                label: '链接',
                value: 'link'
            }, {
                label: '组',
                value: 'group'
            }]
    },
    ability: {
        label: 'Ability',
        type: 'relationship',
        ref: 'alaska-user.Ability'
    },
    link: {
        label: 'Link',
        type: String,
        default: '',
        hidden: {
            type: 'group'
        },
        fullWidth: true
    },
    parent: {
        label: 'Parent Menu',
        type: 'category',
        ref: 'AdminMenu',
        filters: {
            type: 'group'
        }
    },
    nav: {
        label: 'Nav',
        type: 'relationship',
        ref: 'AdminNav',
        switch: true,
        hidden: 'parent',
        default: 'default'
    },
    service: {
        label: 'Service',
        type: String
    },
    sort: {
        label: 'Sort',
        type: Number,
        default: 0
    },
    super: {
        label: 'Super',
        type: Boolean,
        super: true,
        noexport: true
    },
    activated: {
        label: 'Activated',
        type: Boolean
    }
};
exports.default = AdminMenu;
