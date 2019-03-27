"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
class Comment extends alaska_model_1.Model {
    preSave() {
        if (this.pics && this.pics.length) {
            this.pic = this.pics[0];
        }
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
    }
}
Comment.label = 'Comment';
Comment.icon = 'commenting';
Comment.defaultColumns = 'type user content createdAt';
Comment.defaultSort = '-createdAt';
Comment.populations = {
    user: {
        select: ':tiny'
    }
};
Comment.api = {
    paginate: 1,
    list: 1,
    show: 1,
};
Comment.fields = {
    user: {
        label: 'User',
        type: 'relationship',
        ref: 'alaska-user.User'
    },
    type: {
        label: 'Type',
        type: 'select',
        required: true,
        options: [{
                label: 'Goods',
                value: 'goods',
                optional: 'alaska-goods'
            }]
    },
    order: {
        label: 'Order',
        type: 'relationship',
        ref: 'alaska-order.Order',
        optional: 'alaska-order',
        protected: true,
        hidden: '!order'
    },
    orderGoods: {
        label: 'Order Goods',
        type: 'relationship',
        ref: 'alaska-order.OrderGoods',
        optional: 'alaska-order',
        protected: true,
        hidden: '!orderGoods'
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
    sku: {
        label: 'Sku',
        type: 'relationship',
        ref: 'alaska-sku.Sku',
        optional: 'alaska-sku',
        filters: {
            goods: ':goods'
        },
        hidden: {
            type: { $ne: 'goods' }
        }
    },
    skuDesc: {
        label: 'Sku Desc',
        type: String,
        optional: 'alaska-sku',
        hidden: true
    },
    content: {
        label: 'Content',
        type: String,
        required: true
    },
    pic: {
        label: 'Main Picture',
        type: 'image',
        view: '',
        hidden: true
    },
    pics: {
        label: 'Pictures',
        type: 'image',
        multi: true,
        cell: ''
    },
    reply: {
        label: 'Reply',
        type: 'relationship',
        ref: 'alaska-comment.Comment',
        default: null
    },
    parents: {
        label: 'Parent comments',
        type: 'relationship',
        ref: 'alaska-comment.Comment',
        multi: true,
        protected: true,
        hidden: true
    },
    level: {
        label: 'Level',
        type: Number,
        default: 1,
        hidden: true
    },
    createdAt: {
        label: 'Created At',
        type: Date
    }
};
exports.default = Comment;
