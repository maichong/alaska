"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
const Category_1 = require("alaska-category/models/Category");
function defaultFilters(ctx) {
    if (ctx.shop || ctx.service.id === 'alaska-admin' || ctx.state.apiAction === 'show')
        return null;
    return {
        activated: true
    };
}
class Goods extends alaska_model_1.Model {
    static async incInventory(id, quantity, dbSession) {
        return await Goods.findOneAndUpdate({ _id: id }, { $inc: { inventory: quantity } }, { new: true }).session(dbSession);
    }
    static async incVolume(id, quantity, dbSession) {
        return await Goods.findOneAndUpdate({ _id: id }, { $inc: { volume: quantity } }, { new: true }).session(dbSession);
    }
    async preSave() {
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
        if ((this.isNew || this.isModified('pics')) && this.pics.length) {
            this.pic = this.pics[0];
        }
        if (this.isModified('cat')) {
            let cat = await Category_1.default.findById(this.cat);
            this.cats = cat ? cat.parents.concat([this.cat]) : [this.cat];
        }
    }
}
Goods.label = 'Goods';
Goods.icon = 'gift';
Goods.defaultColumns = 'pic title shop brand cat cats price discount volume inventory activated recommend isHot sort createdAt';
Goods.defaultSort = '-sort';
Goods.searchFields = 'title';
Goods.filterFields = 'cat shop brand price?range recommend activated @search';
Goods.api = {
    count: 1,
    paginate: 1,
    list: 1,
    show: 1,
    create: 2,
    update: 2,
    remove: 2
};
Goods.defaultFilters = defaultFilters;
Goods.scopes = {
    list: 'title shop brand pic brief recommend isHot cat price discount discountStartAt discountEndAt volume inventory'
};
Goods.groups = {
    inventory: {
        title: 'Inventory'
    },
    price: {
        title: 'Price'
    },
    desc: {
        title: 'Description'
    }
};
Goods.fields = {
    title: {
        label: 'Title',
        type: String,
        required: true
    },
    brief: {
        label: 'Brief',
        type: String
    },
    pic: {
        label: 'Main Picture',
        type: 'image',
        view: ''
    },
    pics: {
        label: 'Pictures',
        type: 'image',
        multi: true,
        cell: ''
    },
    store: {
        label: 'Store',
        type: 'select:store',
        disabled: '!isNew',
        switch: true,
        default: 'default',
        options: [{
                label: 'Default',
                value: 'default'
            }]
    },
    shop: {
        label: 'Shop',
        type: 'relationship',
        ref: 'alaska-shop.Shop',
        optional: 'alaska-shop',
        index: true
    },
    brand: {
        label: 'Brand',
        type: 'relationship',
        ref: 'alaska-brand.Brand',
        optional: 'alaska-brand',
        index: true
    },
    cat: {
        label: 'Category',
        type: 'category',
        ref: Category_1.default,
        index: true,
        filters: {
            group: 'goods'
        }
    },
    cats: {
        label: 'Categories',
        type: 'relationship',
        ref: Category_1.default,
        index: true,
        multi: true,
        protected: true,
        hidden: true
    },
    recommend: {
        label: 'Recommend',
        type: Boolean
    },
    isHot: {
        label: 'Is Hot Goods',
        type: Boolean
    },
    activated: {
        label: 'Activated',
        type: Boolean,
        protected: true
    },
    seoTitle: {
        label: 'SEO Title',
        type: String,
        default: ''
    },
    seoKeywords: {
        label: 'SEO Keywords',
        type: String,
        default: ''
    },
    seoDescription: {
        label: 'SEO Description',
        type: String,
        default: ''
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
        group: 'price',
        min: 0,
        disabled: {
            'skus.length': {
                $gt: 0
            }
        }
    },
    discount: {
        label: 'Discount',
        type: 'money',
        help: '0 for no discount',
        group: 'price',
        min: 0,
        disabled: {
            'skus.length': {
                $gt: 0
            }
        }
    },
    discountStartAt: {
        label: 'Discount Start',
        type: Date,
        group: 'price'
    },
    discountEndAt: {
        label: 'Discount End',
        type: Date,
        group: 'price'
    },
    shipping: {
        label: 'Shipping',
        type: 'money',
        group: 'price',
        min: 0,
        default: 0
    },
    shippingShareLimit: {
        label: 'Shipping Share Limit',
        type: Number,
        precision: 0,
        min: 0,
        default: 1,
        group: 'price',
        hidden: '!shipping',
        help: 'shippingShareLimit_help'
    },
    inventory: {
        label: 'Inventory',
        type: Number,
        min: 0,
        default: 0,
        group: 'inventory',
        disabled: {
            'skus.length': {
                $gt: 0
            }
        }
    },
    volume: {
        label: 'Volume',
        type: Number,
        default: 0,
        min: 0,
        group: 'inventory',
        disabled: {
            'skus.length': {
                $gt: 0
            }
        }
    },
    sort: {
        label: 'Sort',
        type: Number,
        default: 0,
        protected: true
    },
    createdAt: {
        label: 'Created At',
        type: Date
    },
    commentCount: {
        label: 'Comments Count',
        type: Number,
        default: 0,
        min: 0,
        optional: 'alaska-comment'
    },
    desc: {
        label: 'Description',
        type: 'html',
        default: '',
        group: 'desc',
        horizontal: false,
        nolabel: true
    }
};
Goods.virtuals = {
    get discountValid() {
        let now = new Date();
        return (!this.discountStartAt || this.discountStartAt < now) && (!this.discountEndAt || this.discountEndAt > now);
    }
};
exports.default = Goods;
