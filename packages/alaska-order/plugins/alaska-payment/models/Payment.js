"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fields = {
    orders: {
        label: 'Orders',
        type: 'relationship',
        ref: 'alaska-order.Order',
        multi: true,
        protected: true,
        disabled: true
    }
};
