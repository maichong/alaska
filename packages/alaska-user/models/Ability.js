"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
const __1 = require("..");
class Ability extends alaska_model_1.Model {
    preSave() {
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
        this._isNew = this.isNew;
        if (['god', 'every'].includes(String(this.id)))
            throw new Error('Invalid ability id');
    }
    postSave() {
        if (this._isNew) {
            __1.default.clearUserAbilitiesCache();
        }
    }
}
Ability.label = 'Ability';
Ability.icon = 'unlock-alt';
Ability.defaultColumns = '_id title createdAt';
Ability.filterFields = '@search';
Ability.searchFields = '_id title';
Ability.defaultSort = '_id';
Ability.fields = {
    _id: {
        type: String,
        required: true
    },
    title: {
        label: 'Title',
        type: String
    },
    createdAt: {
        label: 'Created At',
        type: Date
    }
};
exports.default = Ability;
