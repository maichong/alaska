"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
class CartGoods extends alaska_model_1.Model {
    preSave() {
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
    }
}
CartGoods.label = 'Cart Goods';
CartGoods.icon = 'shopping-cart';
CartGoods.defaultColumns = 'pic title user shop goods price sku createdAt';
CartGoods.filterFields = 'user goods createdAt?range';
CartGoods.defaultSort = '-sort';
CartGoods.defaultLimit = 100;
CartGoods.nocreate = true;
CartGoods.populations = {};
CartGoods.api = {
    count: 2,
    list: 2,
    create: 2,
    remove: 2,
    removeMulti: 2,
    update: 2
};
CartGoods.fields = {
    pic: {
        label: 'Picture',
        disabled: true,
        type: 'image'
    },
    title: {
        label: 'Title',
        type: String,
        disabled: true,
        required: true
    },
    goods: {
        label: 'Goods',
        type: 'relationship',
        ref: 'alaska-goods.Goods',
        disabled: true
    },
    sku: {
        label: 'SKU',
        type: 'relationship',
        ref: 'alaska-sku.Sku',
        optional: 'alaska-sku',
        disabled: true
    },
    skuDesc: {
        label: 'SKU Desc',
        disabled: true,
        type: String
    },
    user: {
        label: 'User',
        type: 'relationship',
        ref: 'alaska-user.User',
        disabled: true,
        index: true
    },
    shop: {
        label: 'Shop',
        type: 'relationship',
        ref: 'alaska-shop.Shop',
        optional: 'alaska-shop',
        disabled: true
    },
    currency: {
        label: 'Currency',
        type: 'relationship',
        ref: 'alaska-currency.Currency',
        optional: 'alaska-currency',
        defaultField: 'isDefault',
        switch: true,
        group: 'price'
    },
    price: {
        label: 'Price',
        type: 'money',
        disabled: true
    },
    discount: {
        label: 'Discount',
        type: 'money',
        disabled: true
    },
    quantity: {
        label: 'Quantity',
        type: Number,
        default: 1
    },
    createdAt: {
        label: 'Created At',
        disabled: true,
        type: Date
    }
};
exports.default = CartGoods;
