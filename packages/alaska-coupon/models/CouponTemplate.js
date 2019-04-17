"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const random = require("string-random");
const alaska_model_1 = require("alaska-model");
class CouponTemplate extends alaska_model_1.Model {
    preSave() {
        if (!this.code) {
            this.code = random(8).toUpperCase();
        }
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
    }
}
CouponTemplate.label = 'Coupon Template';
CouponTemplate.icon = 'credit-card-alt';
CouponTemplate.defaultColumns = 'code title type rate amount starting shops cats goods activated createdAt expiredAt';
CouponTemplate.defaultSort = '-createdAt';
CouponTemplate.filterFields = 'type?switch&nolabel shops rate@range amount@range @search';
CouponTemplate.searchFields = 'code title';
CouponTemplate.relationships = {
    coupons: {
        ref: 'alaska-coupon.Coupon',
        path: 'template'
    },
    orders: {
        ref: 'alaska-order.Order',
        path: 'couponTemplate'
    }
};
CouponTemplate.fields = {
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
    activated: {
        label: 'Template Activated',
        type: Boolean
    },
    type: {
        label: 'Type',
        type: 'select',
        switch: true,
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
    couponPeriod: {
        label: 'Coupon Period',
        type: Number,
        addonAfter: 'days'
    },
    couponExpiredAt: {
        label: 'Coupon Expired At',
        type: Date
    },
    createdAt: {
        label: 'Created At',
        type: Date
    },
    expiredAt: {
        label: 'Template Expired At',
        type: Date,
        protected: true
    }
};
exports.default = CouponTemplate;
