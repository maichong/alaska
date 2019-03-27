"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
const moment = require("moment");
function defaultFilters(ctx) {
    if (ctx.service.id === 'alaska-admin')
        return null;
    return {
        activated: true,
        startAt: { $lte: new Date() },
        endAt: { $gte: new Date() }
    };
}
class Banner extends alaska_model_1.Model {
    preSave() {
        if (!this.startAt) {
            this.startAt = new Date();
        }
        if (!this.endAt) {
            this.endAt = moment(this.startAt).add(1, 'year').endOf('year').toDate();
        }
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
    }
    isValid() {
        let now = new Date();
        return this.activated && this.startAt < now && this.endAt > now;
    }
}
Banner.label = 'Banner';
Banner.icon = 'picture-o';
Banner.defaultSort = '-sort';
Banner.defaultColumns = 'pic title position sort clicks activated startAt endAt';
Banner.filterFields = 'activated place?nolabel action?switch&nolabel @search';
Banner.searchFields = 'title';
Banner.defaultFilters = defaultFilters;
Banner.api = {
    list: 1
};
Banner.fields = {
    title: {
        label: 'Title',
        type: String,
        required: true
    },
    pic: {
        label: 'Picture',
        type: 'image',
        required: true
    },
    place: {
        label: 'Place',
        type: 'select',
        default: 'default',
        options: [{
                label: 'Default',
                value: 'default'
            }]
    },
    action: {
        label: 'Action',
        type: 'select',
        switch: true,
        default: 'url',
        options: [{
                label: 'URL',
                value: 'url'
            }, {
                label: 'Goods',
                value: 'goods',
                optional: 'alaska-goods'
            }, {
                label: 'Goods List',
                value: 'goods-list',
                optional: 'alaska-goods'
            }, {
                label: 'Shop',
                value: 'shop',
                optional: 'alaska-shop'
            }, {
                label: 'Post',
                value: 'post',
                optional: 'alaska-post'
            }]
    },
    url: {
        label: 'URL',
        type: String,
        hidden: {
            action: {
                $ne: 'url'
            }
        }
    },
    post: {
        label: 'Post',
        type: 'relationship',
        ref: 'alaska-post.Post',
        optional: 'alaska-post',
        hidden: {
            action: {
                $ne: 'post'
            }
        }
    },
    shop: {
        label: 'Shop',
        type: 'relationship',
        ref: 'alaska-shop.Shop',
        optional: 'alaska-shop',
        hidden: {
            action: {
                $ne: 'shop'
            }
        }
    },
    goods: {
        label: 'Goods',
        type: 'relationship',
        ref: 'alaska-goods.Goods',
        optional: 'alaska-goods',
        hidden: {
            action: {
                $ne: 'goods'
            }
        }
    },
    category: {
        label: 'Category',
        type: 'category',
        ref: 'alaska-category.Category',
        optional: 'alaska-category',
        hidden: {
            action: {
                $ne: 'goods-list'
            }
        }
    },
    search: {
        label: '搜索词',
        type: String,
        hidden: {
            action: {
                $ne: 'goods-list'
            }
        }
    },
    sort: {
        label: 'Sort',
        type: Number,
        default: 0,
        protected: true
    },
    clicks: {
        label: 'Clicks',
        type: Number,
        default: 0,
        disabled: true,
        protected: true
    },
    activated: {
        label: 'Activated',
        type: Boolean,
        default: true,
        protected: true
    },
    startAt: {
        label: 'Start At',
        type: Date,
        protected: true
    },
    endAt: {
        label: 'End At',
        type: Date,
        protected: true,
        index: true
    },
    createdAt: {
        label: 'Created At',
        type: Date,
        hidden: '!createdAt',
        protected: true
    }
};
exports.default = Banner;
