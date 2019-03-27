"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
class OrderLog extends alaska_model_1.Model {
    preSave() {
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
    }
}
OrderLog.label = 'Order Log';
OrderLog.icon = 'hourglass-2';
OrderLog.defaultColumns = 'title order state createdAt';
OrderLog.filterFields = 'state?switch&nolabel order createdAt?range';
OrderLog.defaultSort = '-createdAt';
OrderLog.nocreate = true;
OrderLog.noupdate = true;
OrderLog.noremove = true;
OrderLog.api = {
    list: 2
};
OrderLog.fields = {
    title: {
        label: 'Title',
        type: String,
        required: true,
        translate: true
    },
    order: {
        label: 'Order',
        type: 'relationship',
        ref: 'Order',
        index: true
    },
    user: {
        label: 'User',
        type: 'relationship',
        ref: 'alaska-user.User',
        hidden: true
    },
    shop: {
        label: 'Shop',
        type: 'relationship',
        ref: 'alaska-shop.Shop',
        optional: 'alaska-shop',
        hidden: true
    },
    state: {
        label: 'State',
        type: 'select',
        number: true,
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
    createdAt: {
        label: 'Created At',
        type: Date
    }
};
exports.default = OrderLog;
