"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
class RechargeRule extends alaska_model_1.Model {
    preSave() {
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
    }
}
RechargeRule.label = 'Recharge Rule';
RechargeRule.icon = 'exchange';
RechargeRule.defaultColumns = 'title sort createdAt';
RechargeRule.defaultSort = '-sort';
RechargeRule.fields = {
    payment: {
        label: 'Payment Type',
        type: 'select:payment',
        required: true
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
    rechargeAccount: {
        label: 'Recharge Account',
        type: 'select:account',
        disabled: '!isNew',
        hidden: {
            target: {
                $ne: 'account'
            }
        },
    },
    type: {
        label: 'Type',
        type: 'select',
        default: 'rate',
        options: [{
                label: 'Rate',
                value: 'rate'
            }, {
                label: 'Amount',
                value: 'amount'
            }]
    },
    paymentCurrency: {
        label: 'Payment Currency',
        type: 'relationship',
        ref: 'alaska-currency.Currency',
        optional: 'alaska-currency',
        defaultField: 'isDefault',
        switch: true,
        required: true,
    },
    paymentAmount: {
        label: 'Payment Amount',
        type: Number,
        default: 0,
        format: '',
        hidden: {
            type: 'rate'
        }
    },
    rechargeCurrency: {
        label: 'Recharge Currency',
        type: 'relationship',
        ref: 'alaska-currency.Currency',
        optional: 'alaska-currency',
        defaultField: 'isDefault',
        switch: true,
        required: true,
    },
    rechargeAmount: {
        label: 'Recharge Amount',
        type: Number,
        default: 0,
        format: '',
        hidden: {
            type: 'rate'
        }
    },
    rate: {
        label: 'Rate',
        type: Number,
        default: 0,
        format: '',
        hidden: {
            type: 'amount'
        }
    },
    createdAt: {
        label: 'Created At',
        type: Date
    }
};
exports.default = RechargeRule;
