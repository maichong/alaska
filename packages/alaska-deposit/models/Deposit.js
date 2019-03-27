"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const alaska_model_1 = require("alaska-model");
class Deposit extends alaska_model_1.Model {
    preSave() {
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
        if (!this.expiredAt) {
            this.expiredAt = moment().add('1', 'months').toDate();
        }
    }
}
Deposit.label = 'Deposit';
Deposit.icon = 'credit-card';
Deposit.titleField = 'title';
Deposit.defaultColumns = 'title user currency amount balance createdAt expiredAt';
Deposit.defaultSort = '-createdAt';
Deposit.api = {
    show: 2,
    list: 2,
    paginate: 2
};
Deposit.fields = {
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
        type: 'money'
    },
    balance: {
        label: 'Balance',
        type: 'money'
    },
    createdAt: {
        label: 'Created At',
        type: Date
    },
    expiredAt: {
        label: 'Expired At',
        type: Date
    }
};
exports.default = Deposit;
