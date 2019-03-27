"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
class Income extends alaska_model_1.Model {
    preSave() {
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
        if (!this.target && this.deposit) {
            this.target = 'deposit';
        }
    }
}
Income.label = 'Income Record';
Income.icon = 'usd';
Income.defaultColumns = 'title user type target deposit currency amount balance createdAt';
Income.defaultSort = '-createdAt';
Income.searchFields = 'title';
Income.filterFields = 'user type?nolabel&switch target?nolabel deposit currency?nolabel&switch amount?range createdAt?range';
Income.api = {
    count: 2,
    paginate: 2,
    show: 2
};
Income.fields = {
    title: {
        label: 'Title',
        type: String,
        required: true
    },
    user: {
        label: 'User',
        type: 'relationship',
        ref: 'alaska-user.User',
        index: true,
        disabled: '!isNew',
        required: true
    },
    type: {
        label: 'Type',
        type: 'select',
        disabled: '!isNew',
        default: '',
        options: [{
                label: 'Unknown',
                value: ''
            }, {
                label: 'Award',
                value: 'award'
            }, {
                label: 'Payment',
                value: 'payment'
            }, {
                label: 'Refund',
                value: 'refund'
            }, {
                label: 'Recharge',
                value: 'recharge',
                optional: 'alaska-recharge'
            }, {
                label: 'Withdraw',
                value: 'withdraw',
                optional: 'alaska-withdraw'
            }, {
                label: 'Withdraw Rejected',
                value: 'withdraw_rejected',
                optional: 'alaska-withdraw'
            }, {
                label: 'Commission',
                value: 'commission',
                optional: 'alaska-commission'
            }, {
                label: 'Sell',
                value: 'sell'
            }]
    },
    target: {
        label: 'Target',
        type: 'select',
        disabled: '!isNew',
        default: 'account',
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
        disabled: '!isNew',
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
        disabled: '!isNew',
        type: 'relationship',
        ref: 'alaska-currency.Currency',
        optional: 'alaska-currency'
    },
    amount: {
        label: 'Amount',
        type: 'money',
        disabled: '!isNew'
    },
    balance: {
        label: 'Balance',
        type: 'money',
        disabled: '!isNew'
    },
    createdAt: {
        label: 'Created At',
        type: Date,
        disabled: '!isNew'
    }
};
exports.default = Income;
