"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
const Ability_1 = require("./Ability");
const __1 = require("..");
class Role extends alaska_model_1.Model {
    preSave() {
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
        this._clearCache = this.isNew || this.isModified('abilities');
    }
    postSave() {
        if (this._clearCache) {
            __1.default.clearUserAbilitiesCache();
        }
    }
}
Role.label = 'Role';
Role.icon = 'users';
Role.defaultSort = '-sort';
Role.defaultColumns = '_id title sort createdAt';
Role.filterFields = '@search';
Role.searchFields = 'title';
Role.fields = {
    _id: {
        type: String,
        required: true
    },
    title: {
        label: 'Title',
        type: String
    },
    abilities: {
        label: 'Abilities',
        type: 'relationship',
        ref: Ability_1.default,
        multi: true
    },
    sort: {
        label: 'Sort',
        type: Number,
        default: 0
    },
    createdAt: {
        label: 'Created At',
        type: Date
    }
};
exports.default = Role;
