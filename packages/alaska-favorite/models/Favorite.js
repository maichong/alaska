"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
class Favorite extends alaska_model_1.Model {
    preSave() {
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
    }
}
Favorite.label = 'Favorite';
Favorite.icon = 'heart';
Favorite.defaultColumns = 'pic title user type goods shop brand post createdAt';
Favorite.filterFields = 'type?switch&nolabel user createdAt?range';
Favorite.defaultSort = '-createdAt';
Favorite.api = {
    list: 2,
    paginate: 2,
    create: 2,
    remove: 2
};
Favorite.fields = {
    title: {
        label: 'Title',
        type: String,
        required: true
    },
    pic: {
        label: 'Picture',
        type: 'image'
    },
    user: {
        label: 'User',
        type: 'relationship',
        ref: 'alaska-user.User',
        required: true,
        index: true
    },
    type: {
        label: 'Type',
        type: 'select',
        switch: true,
        required: true,
        options: [{
                label: 'Goods',
                value: 'goods',
                optional: 'alaska-goods'
            }, {
                label: 'Shop',
                value: 'shop',
                optional: 'alaska-shop'
            }, {
                label: 'Brand',
                value: 'brand',
                optional: 'alaska-brand'
            }, {
                label: 'Post',
                value: 'post',
                optional: 'alaska-post'
            }]
    },
    goods: {
        label: 'Goods',
        type: 'relationship',
        ref: 'alaska-goods.Goods',
        optional: 'alaska-goods',
        hidden: {
            type: { $ne: 'goods' }
        }
    },
    shop: {
        label: 'Shop',
        type: 'relationship',
        ref: 'alaska-shop.Shop',
        optional: 'alaska-shop',
        hidden: {
            type: { $ne: 'shop' }
        }
    },
    brand: {
        label: 'Brand',
        type: 'relationship',
        ref: 'alaska-brand.Brand',
        optional: 'alaska-brand',
        hidden: {
            type: { $ne: 'brand' }
        }
    },
    post: {
        label: 'Post',
        type: 'relationship',
        ref: 'alaska-post.Post',
        optional: 'alaska-post',
        hidden: {
            type: { $ne: 'post' }
        }
    },
    createdAt: {
        label: 'Created At',
        type: Date
    }
};
exports.default = Favorite;
