"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const alaska_1 = require("alaska");
const alaska_model_1 = require("alaska-model");
const utils_1 = require("alaska-model/utils");
const OrderLog_1 = require("./OrderLog");
const OrderGoods_1 = require("./OrderGoods");
const __1 = require("..");
function defaultFilters(ctx) {
    if (ctx.state.apiAction === 'show' || ctx.state.adminApi === 'details')
        return null;
    let field = ctx.service.id === 'alaska-admin' ? 'adminDeleted' : 'userDeleted';
    return {
        [field]: {
            $ne: true
        }
    };
}
class Order extends alaska_model_1.Model {
    async preValidate() {
        if (this.address && !_.isObject(this.address)) {
            throw new alaska_1.NormalError('Address format error!');
        }
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
        if (!this.code) {
            this.code = await __1.default.config.get('codeCreator')(this);
        }
    }
    preSave() {
        if (this.isNew) {
            this.pay = (this.total || 0) + (this.shipping || 0) - (this.deduction || 0);
        }
        this._logTotal = !this.isNew && this.isModified('total');
        this._logShipping = !this.isNew && this.isModified('shipping');
        this._logDeduction = !this.isNew && this.isModified('deduction');
        this._stateChanged = this.isNew || this.isModified('state');
    }
    async postSave() {
        if (this._logTotal) {
            this.createLog('Modified total price', this.$session());
        }
        if (this._logShipping) {
            this.createLog('Modified shipping fee', this.$session());
        }
        if (this._logDeduction) {
            this.createLog('Modified deduction', this.$session());
        }
        if (this._stateChanged && this.goods && this.goods.length) {
            await OrderGoods_1.default.updateMany({ order: this._id }, { state: this.state }).session(this.$session()).exec();
        }
    }
    createLog(title, dbSession) {
        let log = new OrderLog_1.default({ title, order: this, state: this.state, user: this.user, shop: this.shop });
        log.save({ session: dbSession });
        return log;
    }
    canAppendGoods(goods) {
        if (this.shop) {
            return utils_1.isIdEqual(this.shop, goods.shop);
        }
        return !goods.shop;
    }
}
Order.label = 'Order';
Order.icon = 'file-text-o';
Order.defaultColumns = 'pic code title user shop total payed refundedAmount state createdAt';
Order.defaultSort = '-createdAt';
Order.searchFields = 'title';
Order.nocreate = true;
Order.noremove = true;
Order.filterFields = 'type?switch&nolabel store?switch&nolabel state?switch&nolabel shop user total?range @search';
Order.defaultFilters = defaultFilters;
Order.relationships = {
    orderGoods: {
        ref: 'OrderGoods',
        path: 'order'
    },
    logs: {
        ref: 'OrderLog',
        path: 'order',
        protected: true
    }
};
Order.populations = {
    goods: {
        auto: true,
        path: 'goods'
    },
    shop: {
        auto: true,
        path: 'shop'
    },
    expressCompany: {
        auto: true,
        path: 'expressCompany'
    }
};
Order.scopes = {};
Order.api = {
    list: 2,
    paginate: 2,
    count: 2,
    show: 2,
    create: 2
};
Order.actions = {
    confirm: {
        title: 'Confirm Order',
        icon: 'check',
        color: 'success',
        sled: 'Confirm',
        hidden: {
            state: {
                $ne: 300
            }
        }
    },
    reject: {
        title: 'Reject Order',
        icon: 'ban',
        color: 'danger',
        sled: 'Reject',
        confirm: 'Confirm to reject the order?',
        hidden: {
            state: {
                $ne: 300
            }
        }
    },
    ship: {
        title: 'Ship',
        icon: 'truck',
        color: 'success',
        sled: 'Ship',
        hidden: {
            state: {
                $ne: 400
            }
        }
    },
    acceptRefund: {
        title: 'Accept Refund',
        icon: 'check',
        color: 'warning',
        confirm: 'Confirm to accept refund?',
        sled: 'AcceptRefund',
        hidden: {
            state: {
                $ne: 800
            }
        }
    },
    rejectRefund: {
        title: 'Reject Refund',
        icon: 'times',
        color: 'danger',
        confirm: 'Confirm to reject refund?',
        sled: 'RejectRefund',
        hidden: {
            state: {
                $ne: 800
            }
        }
    },
    delete: {
        title: 'Delete',
        icon: 'trash-o',
        color: 'danger',
        confirm: 'Confirm to delete the order?',
        sled: 'Delete',
        post: 'js:history.back()'
    }
};
Order.fields = {
    code: {
        label: 'Order Code',
        type: String,
        unique: true,
        disabled: true
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
    type: {
        label: 'Type',
        type: 'select',
        default: 'goods',
        options: [{
                label: 'Goods',
                value: 'goods'
            }]
    },
    pic: {
        label: 'Picture',
        type: 'image'
    },
    goods: {
        label: 'Order Goods',
        type: 'relationship',
        ref: 'OrderGoods',
        hidden: true,
        multi: true,
        disabled: true
    },
    delivery: {
        label: 'Delivery',
        type: 'select',
        switch: true,
        default: 'express',
        options: [{
                label: 'None',
                value: 'none'
            }, {
                label: 'Express',
                value: 'express'
            }, {
                label: 'Self Help',
                value: 'self'
            }]
    },
    expressCompany: {
        label: 'Express Company',
        type: 'relationship',
        ref: 'alaska-express-company.ExpressCompany',
        optional: 'alaska-express-company',
        hidden: {
            delivery: { $ne: 'express' }
        }
    },
    expressCode: {
        label: 'Express Code',
        type: String,
        hidden: {
            delivery: { $ne: 'express' }
        }
    },
    address: {
        label: 'Address',
        type: Object,
        hidden: {
            delivery: {
                $ne: 'express'
            }
        }
    },
    message: {
        label: 'Buyer Message',
        type: String,
        multi: true
    },
    quantity: {
        label: 'Quantity',
        type: Number
    },
    currency: {
        label: 'Currency',
        type: 'relationship',
        ref: 'alaska-currency.Currency',
        optional: 'alaska-currency',
        defaultField: 'isDefault',
        switch: true,
    },
    shipping: {
        label: 'Shipping',
        type: 'money',
        min: 0
    },
    total: {
        label: 'Total Amount',
        type: 'money',
        min: 0
    },
    deduction: {
        label: 'Deduction',
        type: 'money',
        min: 0
    },
    pay: {
        label: 'Pay Amount',
        type: 'money',
        min: 0,
        disabled: true
    },
    payed: {
        label: 'Payed Amount',
        type: 'money',
        min: 0
    },
    deductionCurrency: {
        label: 'Deduction Currency',
        hidden: '!deductionCurrency',
        type: 'relationship',
        ref: 'alaska-currency.Currency',
        optional: 'alaska-currency',
        switch: true,
    },
    deductionAccount: {
        label: 'Account',
        type: 'select:account'
    },
    deductionAmount: {
        label: 'Deduction Amount',
        type: 'money',
        currencyField: 'deductionCurrency',
        hidden: '!deductionAmount',
        min: 0
    },
    payment: {
        label: 'Payment',
        type: 'select',
        options: []
    },
    refundedAmount: {
        label: 'Refunded Amount',
        type: 'money',
        min: 0,
        hidden: '!refundedAmount'
    },
    refundedQuantity: {
        label: 'Refunded Quantity',
        type: Number,
        min: 0,
        hidden: '!refundedQuantity'
    },
    refundExpressCode: {
        label: 'Refund Express Code',
        type: String,
        hidden: '!refundExpressCode'
    },
    refundReason: {
        label: 'Refund Reason',
        type: String,
        hidden: '!refundReason'
    },
    refundAmount: {
        label: 'Refund Amount',
        type: 'money',
        min: 0,
        hidden: '!refundAmount'
    },
    refundQuantity: {
        label: 'Refund Quantity',
        type: Number,
        min: 0,
        hidden: '!refundQuantity'
    },
    lastRefundAmount: {
        label: 'Last Refund Amount',
        type: 'money',
        min: 0,
        hidden: true,
        disabled: true
    },
    lastRefundQuantity: {
        label: 'Last Refund Quantity',
        type: Number,
        min: 0,
        hidden: true,
        disabled: true
    },
    shipped: {
        label: 'Shipped',
        type: Boolean,
        hidden: true
    },
    closed: {
        label: 'Closed',
        type: Boolean,
        hidden: true
    },
    commented: {
        label: 'Commented',
        type: Boolean,
        optional: 'alaska-comment'
    },
    state: {
        label: 'State',
        type: 'select',
        number: true,
        index: true,
        default: 200,
        options: [{
                label: 'Order_New',
                value: 200
            }, {
                label: 'Order_Payed',
                value: 300
            }, {
                label: 'Order_Confirmed',
                value: 400
            }, {
                label: 'Order_Shipped',
                value: 500
            }, {
                label: 'Order_Closed',
                value: 600
            }, {
                label: 'Order_Refund',
                value: 800
            }, {
                label: 'Order_Failed',
                value: 900
            }]
    },
    failure: {
        label: 'Failure Reason',
        type: String,
        hidden: '!failure'
    },
    createdAt: {
        label: 'Created At',
        type: Date
    },
    payedAt: {
        label: 'Payed At',
        type: Date,
        hidden: '!payedAt'
    },
    paymentTimeout: {
        label: 'Payment Timeout',
        type: Date,
        hidden: '!paymentTimeout'
    },
    receivedAt: {
        label: 'Received At',
        type: Date,
        hidden: '!receivedAt'
    },
    receiveTimeout: {
        label: 'Receive Timeout',
        type: Date,
        hidden: '!receiveTimeout'
    },
    refundTimeout: {
        label: 'Refund Timeout',
        type: Date,
        hidden: '!refundTimeout'
    },
    userDeleted: {
        label: 'User Deleted',
        type: Boolean,
        hidden: true
    },
    adminDeleted: {
        label: 'Admin Deleted',
        type: Boolean,
        hidden: true
    }
};
exports.default = Order;
