"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
class Withdraw extends alaska_model_1.Model {
    preSave() {
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
        if (!this.title) {
            this.title = 'Withdraw';
        }
    }
}
Withdraw.label = 'Withdraw';
Withdraw.icon = 'share-square';
Withdraw.titleField = 'title';
Withdraw.defaultColumns = 'title user currency amount state createdAt';
Withdraw.filterFields = 'state?switch&nolabel user amount?range createdAt?range';
Withdraw.defaultSort = '-createdAt';
Withdraw.nocreate = true;
Withdraw.noremove = true;
Withdraw.api = {
    create: 2,
    show: 2,
    paginate: 2
};
Withdraw.actions = {
    update: {
        hidden: true
    },
    accept: {
        title: 'Accept',
        sled: 'Accept',
        color: 'success',
        disabled: {
            state: { $ne: 'pending' }
        },
        hidden: {
            state: { $ne: 'pending' }
        }
    },
    reject: {
        title: 'Reject',
        sled: 'Reject',
        color: 'danger',
        disabled: {
            state: { $ne: 'pending' }
        },
        hidden: {
            state: { $ne: 'pending' }
        }
    }
};
Withdraw.fields = {
    title: {
        label: 'Title',
        type: String,
        static: true
    },
    user: {
        label: 'User',
        type: 'relationship',
        ref: 'alaska-user.User',
        required: true,
        static: true
    },
    type: {
        label: 'Payment Type',
        type: 'select:payment',
        options: []
    },
    currency: {
        label: 'Currency',
        type: 'relationship',
        ref: 'alaska-currency.Currency',
        optional: 'alaska-currency',
        switch: true,
        static: true
    },
    account: {
        label: 'Account',
        type: 'select:account',
        required: true
    },
    amount: {
        label: 'Amount',
        type: 'money',
        required: true,
        static: true
    },
    ip: {
        label: 'IP',
        type: String,
        protected: true
    },
    openid: {
        label: 'Weixin OpenID',
        type: String,
        disabled: true,
    },
    alipay: {
        label: 'Alipay',
        type: String,
        disabled: true,
    },
    realName: {
        label: 'Real Name',
        type: String,
        disabled: true,
    },
    note: {
        label: 'Note',
        type: String,
        multiLine: true,
        static: true
    },
    createdAt: {
        label: 'Created At',
        type: Date,
        static: true
    },
    state: {
        label: 'State',
        type: 'select',
        default: 'pending',
        options: [{
                label: 'Pending',
                value: 'pending'
            }, {
                label: 'Accepted',
                value: 'accepted'
            }, {
                label: 'Rejected',
                value: 'rejected'
            }],
        static: true
    },
    reason: {
        label: 'Reject Reason',
        type: String
    }
};
exports.default = Withdraw;
