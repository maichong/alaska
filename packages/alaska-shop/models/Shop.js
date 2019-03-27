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
class Shop extends alaska_model_1.Model {
    preSave() {
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
    }
}
Shop.label = 'Shop';
Shop.icon = 'home';
Shop.defaultColumns = 'logo title user tel brand activated createdAt';
Shop.filterFields = 'user brand @search';
Shop.defaultSort = '-createdAt';
Shop.searchFields = 'title tel desc';
Shop.defaultFilters = defaultFilters;
Shop.relationships = {
    orders: {
        ref: 'alaska-order.Order',
        optional: 'alaska-order',
        path: 'shop'
    }
};
Shop.api = {
    paginate: 1,
    list: 1,
    show: 1
};
Shop.fields = {
    title: {
        label: 'Title',
        type: String,
        required: true
    },
    logo: {
        label: 'Logo',
        type: 'image'
    },
    user: {
        label: 'User',
        type: 'relationship',
        ref: 'alaska-user.User',
        required: true
    },
    brand: {
        label: 'Brand',
        type: 'relationship',
        ref: 'alaska-brand.Brand',
        optional: 'alaska-brand'
    },
    tel: {
        label: 'Tel',
        type: String
    },
    activated: {
        label: 'Activated',
        type: Boolean,
        default: true,
        protected: true
    },
    createdAt: {
        label: 'Created At',
        type: Date
    },
    desc: {
        label: 'Description',
        type: 'html'
    }
};
exports.default = Shop;
