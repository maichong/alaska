"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
const Payment_1 = require("./Payment");
class Refund extends alaska_model_1.Model {
    preSave() {
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
    }
}
Refund.label = 'Refund';
Refund.icon = 'undo';
Refund.defaultColumns = 'title user payment order type amount state createdAt';
Refund.filterFields = 'state?switch&nolabel user createdAt?range';
Refund.defaultSort = '-createdAt';
Refund.nocreate = true;
Refund.noupdate = true;
Refund.fields = {
    title: {
        label: 'Title',
        type: String,
        required: true,
        protected: true
    },
    user: {
        label: 'User',
        type: 'relationship',
        ref: 'alaska-user.User',
        protected: true
    },
    payment: {
        label: 'Payment',
        type: 'relationship',
        ref: Payment_1.default,
        protected: true
    },
    type: {
        label: 'Payment Type',
        type: 'select:payment',
        options: [],
        required: true
    },
    currency: {
        label: 'Currency',
        type: 'relationship',
        ref: 'alaska-currency.Currency',
        optional: 'alaska-currency',
        defaultField: 'isDefault',
        switch: true,
    },
    amount: {
        label: 'Amount',
        type: Number,
        format: '0,0.00',
        required: true,
        protected: true
    },
    state: {
        label: 'State',
        type: 'select',
        default: 'pending',
        options: [{
                label: 'Pending',
                value: 'pending'
            }, {
                label: 'Success',
                value: 'success'
            }, {
                label: 'Failed',
                value: 'failed'
            }]
    },
    failure: {
        label: 'Failure Reason',
        type: String
    },
    createdAt: {
        label: 'Created At',
        type: Date
    }
};
exports.default = Refund;
