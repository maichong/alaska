"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const random = require("string-random");
const alaska_model_1 = require("alaska-model");
class Coupon extends alaska_model_1.Model {
    preSave() {
        if (!this.code) {
            this.code = random(8).toUpperCase();
        }
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
    }
}
Coupon.label = 'Coupon';
Coupon.icon = 'credit-card';
Coupon.defaultColumns = 'code title user type rate amount starting shops cats goods used createdAt expiredAt';
Coupon.defaultSort = '-createdAt';
Coupon.filterFields = 'used type?switch&nolabel user shops rate@range amount@range @search';
Coupon.searchFields = 'code title';
Coupon.api = {
    paginate: 2,
    list: 2,
    count: 2,
    show: 2
};
Coupon.fields = {
    code: {
        label: 'Coupon Code',
        type: String,
        index: true
    },
    title: {
        label: 'Title',
        type: String,
        required: true
    },
    user: {
        label: 'User',
        type: 'relationship',
        ref: 'alaska-user.User',
        required: true,
        index: true
    },
    template: {
        label: 'Coupon Template',
        type: 'relationship',
        ref: 'CouponTemplate'
    },
    used: {
        label: 'Used',
        type: Boolean
    },
    type: {
        label: 'Type',
        type: 'select',
        switch: true,
        required: true,
        default: 'rate',
        options: [{
                label: 'Rate Discount',
                value: 'rate'
            }, {
                label: 'Amount Discount',
                value: 'amount'
            }]
    },
    rate: {
        label: 'Discount Rate',
        type: Number,
        format: '0.00',
        default: 1,
        min: 0,
        max: 1,
        hidden: {
            type: { $ne: 'rate' }
        }
    },
    amount: {
        label: 'Discount Amount',
        type: 'money',
        hidden: {
            type: { $ne: 'amount' }
        }
    },
    starting: {
        label: 'Starting Price',
        type: 'money'
    },
    shop: {
        label: 'Shop Specified',
        type: 'relationship',
        ref: 'alaska-shop.Shop',
        optional: 'alaska-shop',
        help: 'None for all shops'
    },
    cats: {
        label: 'Categories Specified',
        type: 'relationship',
        ref: 'alaska-category.Category',
        optional: 'alaska-category',
        multi: true,
        help: 'None for all categories'
    },
    goods: {
        label: 'Goods Specified',
        type: 'relationship',
        ref: 'alaska-goods.Goods',
        optional: 'alaska-goods',
        multi: true,
        help: 'None for all goods'
    },
    createdAt: {
        label: 'Created At',
        type: Date
    },
    expiredAt: {
        label: 'Expired At',
        type: Date
    }
};
exports.default = Coupon;
