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
class AdminNav extends alaska_model_1.Model {
}
AdminNav.label = 'Admin Nav';
AdminNav.icon = 'bars';
AdminNav.titleField = 'label';
AdminNav.defaultColumns = 'icon label type parent sort service link ability super activated';
AdminNav.defaultSort = '-sort';
AdminNav.searchFields = '_id label link parent';
AdminNav.defaultFilters = defaultFilters;
AdminNav.fields = {
    _id: {
        type: String
    },
    label: {
        label: 'Title',
        type: String,
        required: true
    },
    ability: {
        label: 'Ability',
        type: 'relationship',
        ref: 'alaska-user.Ability'
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
exports.default = AdminNav;
