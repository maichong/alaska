"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
class City extends alaska_model_1.Model {
    preSave() {
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
        if (!this.initial) {
            this.initial = (this.name || '')[0];
        }
    }
}
City.label = 'City';
City.icon = 'map-signs';
City.defaultColumns = 'code initial name tel zip isHot parent level sort createdAt';
City.filterFields = 'level?switch&nolabel @search';
City.defaultSort = 'initial code';
City.titleField = 'name';
City.searchFields = 'code name tel zip';
City.api = {
    paginate: 1,
    list: 1,
};
City.fields = {
    code: {
        label: 'Code',
        type: String
    },
    name: {
        label: 'Name',
        type: String,
        required: true
    },
    initial: {
        label: 'Initial',
        type: String
    },
    tel: {
        label: 'Tel Code',
        type: String
    },
    zip: {
        label: 'Zip Code',
        type: String
    },
    isHot: {
        label: 'Is Hot',
        type: Boolean
    },
    parent: {
        label: 'Parent City',
        type: 'relationship',
        ref: 'City'
    },
    level: {
        label: 'Level',
        type: 'select',
        default: 0,
        number: true,
        options: [{
                label: 'Province',
                value: 1
            }, {
                label: 'City',
                value: 2
            }, {
                label: 'District',
                value: 3
            }]
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
exports.default = City;
