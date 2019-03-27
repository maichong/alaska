"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    fields: {
        promoter: {
            label: 'Promoter',
            type: 'relationship',
            ref: 'User',
            index: true,
            disabled: [{
                    ability: 'alaska-user.User.update'
                }]
        },
        promoterCommissionAmount: {
            label: 'Promoter Commission',
            type: 'money',
            disabled: true
        },
        commissionAmount: {
            label: 'Commission',
            type: 'money',
            disabled: true
        },
    }
};
