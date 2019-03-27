"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
class Recharge extends alaska_model_1.Model {
    preSave() {
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
    }
}
Recharge.label = 'Recharge Record';
Recharge.icon = 'paypal';
Recharge.titleField = 'title';
Recharge.defaultColumns = 'title user target deposit currency amount type state createdAt';
Recharge.defaultSort = '-createdAt';
Recharge.actions = {
    complete: {
        title: 'Complete',
        sled: 'Complete',
        icon: 'check',
        color: 'warning',
        confirm: 'COMPLETE_RECHARGE_WARING',
        hidden: {
            $or: [
                {
                    id: { $exists: false }
                },
                {
                    state: { $ne: 'pending' }
                }
            ]
        }
    }
};
Recharge.fields = {
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
    target: {
        label: 'Target',
        type: 'select',
        default: 'account',
        required: true,
        switch: true,
        options: [{
                label: 'Account',
                value: 'account'
            }, {
                label: 'Deposit',
                value: 'deposit',
                optional: 'alaska-deposit'
            }]
    },
    account: {
        label: 'Account',
        type: 'select:account',
        disabled: '!isNew',
        hidden: {
            target: {
                $ne: 'account'
            }
        },
    },
    deposit: {
        label: 'Deposit',
        type: 'relationship',
        ref: 'alaska-deposit.Deposit',
        optional: 'alaska-deposit',
        hidden: {
            target: {
                $ne: 'deposit'
            }
        },
        filters: {
            user: ':user'
        }
    },
    currency: {
        label: 'Currency',
        type: 'relationship',
        ref: 'alaska-currency.Currency',
        optional: 'alaska-currency',
        defaultField: 'isDefault',
        switch: true,
        required: true,
    },
    amount: {
        label: 'Amount',
        type: Number,
        required: true,
        protected: true
    },
    type: {
        label: 'Payment Type',
        type: 'select:payment',
        checkbox: true,
        default: 'manual',
        options: [{
                label: 'Manual',
                value: 'manual'
            }],
        required: true
    },
    payment: {
        label: 'Payment Logs',
        type: 'relationship',
        ref: 'alaska-payment.Payment',
        disabled: true
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
    createdAt: {
        label: 'Created At',
        type: Date
    }
};
exports.default = Recharge;
