"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
class Commission extends alaska_model_1.Model {
    preSave() {
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
    }
}
Commission.label = 'Commission';
Commission.icon = 'jpy';
Commission.titleField = 'title';
Commission.defaultColumns = 'title user contributor order amount level state createdAt balancedAt';
Commission.defaultSort = '-createdAt';
Commission.api = {
    paginate: 3,
    list: 3
};
Commission.populations = {
    contributor: {
        select: ':tiny'
    }
};
Commission.actions = {
    balance: {
        icon: 'check',
        after: 'add',
        title: 'Balance now',
        color: 'success',
        sled: 'Balance',
        hidden: {
            state: {
                $ne: 'pending'
            }
        }
    }
};
Commission.fields = {
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
    contributor: {
        label: 'Contributor',
        type: 'relationship',
        ref: 'alaska-user.User'
    },
    order: {
        label: 'Order',
        type: 'relationship',
        ref: 'alaska-order.Order',
        optional: 'alaska-order',
        index: true
    },
    main: {
        label: 'Main Commission',
        type: 'relationship',
        ref: 'Commission',
        private: true
    },
    level: {
        label: 'Level',
        type: Number
    },
    currency: {
        label: 'Currency',
        type: 'relationship',
        ref: 'alaska-currency.Currency',
        optional: 'alaska-currency'
    },
    account: {
        label: 'Account',
        type: 'select:account',
        required: true
    },
    amount: {
        label: 'Amount',
        type: 'money'
    },
    state: {
        label: 'State',
        type: 'select',
        default: 'pending',
        options: [{
                label: 'Pending',
                value: 'pending'
            }, {
                label: 'Balanced',
                value: 'balanced'
            }, {
                label: 'Failed',
                value: 'failed'
            }]
    },
    failure: {
        label: 'Failure',
        type: String
    },
    createdAt: {
        label: 'Created At',
        type: Date
    },
    balancedAt: {
        label: 'Balanced At',
        type: Date
    }
};
exports.default = Commission;
