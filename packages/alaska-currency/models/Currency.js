"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
class Currency extends alaska_model_1.Model {
    preSave() {
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
    }
}
Currency.label = 'Currency';
Currency.icon = 'money';
Currency.defaultColumns = '_id title unit precision format rate isDefault createdAt';
Currency.defaultSort = '_id';
Currency.api = {
    paginate: 0,
    list: 0,
    count: 0,
    show: 0,
    create: 0,
    update: 0,
    updateMulti: 0,
    remove: 0,
    removeMulti: 0,
    watch: 0
};
Currency.fields = {
    _id: {
        type: String,
        required: true
    },
    title: {
        label: 'Title',
        type: String,
        required: true
    },
    unit: {
        label: 'Unit',
        type: String,
        default: ''
    },
    precision: {
        label: 'Precision',
        type: Number,
        default: 2
    },
    format: {
        label: 'Format',
        type: String,
        default: '0,0.00'
    },
    rate: {
        label: 'Exchange Rate',
        type: Number,
        default: 1
    },
    isDefault: {
        label: 'Default Currency',
        type: Boolean,
    },
    createdAt: {
        label: 'Created At',
        type: Date
    }
};
exports.default = Currency;
