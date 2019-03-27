"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
class ExpressCompany extends alaska_model_1.Model {
    preSave() {
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
    }
}
ExpressCompany.label = 'Express Company';
ExpressCompany.icon = 'truck';
ExpressCompany.defaultColumns = 'pic id title sort createdAt';
ExpressCompany.defaultSort = '-sort';
ExpressCompany.api = {
    paginate: 1,
    list: 1,
    count: 1,
};
ExpressCompany.fields = {
    _id: {
        type: String,
        required: true
    },
    title: {
        label: 'Title',
        type: String,
        required: true
    },
    logo: {
        label: 'Logo',
        type: 'image'
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
exports.default = ExpressCompany;
