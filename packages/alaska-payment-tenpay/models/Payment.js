"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
function default_1(model) {
    if (_.find(model.fields.type.options, (opt) => opt.value === 'tenpay'))
        return;
    model.fields.type.options.push({ label: 'Tenpay', value: 'tenpay' });
    model.fields.tenpay_transaction_id = {
        label: 'Tenpay Trade No',
        type: String,
        protected: true
    };
    model.fields.openid = {
        label: 'User Openid',
        type: String,
        protected: true
    };
    model.fields.tradeType = {
        label: 'Trade Type',
        type: String,
        protected: true
    };
    return model;
}
exports.default = default_1;
