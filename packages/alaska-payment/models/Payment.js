"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
class Payment extends alaska_model_1.Model {
    preSave() {
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
    }
}
Payment.label = 'Payment Logs';
Payment.icon = 'money';
Payment.defaultColumns = 'title user type amount state createdAt';
Payment.filterFields = 'state?switch&nolabel currency?switch user amount?range';
Payment.defaultSort = '-createdAt';
Payment.nocreate = true;
Payment.noupdate = true;
Payment.api = {
    create: 2
};
Payment.actions = {
    complete: {
        title: 'Complete',
        sled: 'Complete',
        color: 'warning',
        confirm: 'COMPLETE_PAYMENT_WARING',
        hidden: 'state'
    }
};
Payment.fields = {
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
        type: 'money',
        required: true,
        protected: true
    },
    ip: {
        label: 'IP',
        type: String,
        protected: true
    },
    params: {
        label: 'Params',
        type: String
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
    callbackData: {
        label: 'Callback Data',
        type: Object,
        protected: true
    },
    createdAt: {
        label: 'Created At',
        type: Date
    }
};
exports.default = Payment;
