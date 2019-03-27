"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
function default_1(model) {
    if (_.find(model.fields.type.options, (opt) => opt.value === 'alipay'))
        return;
    model.fields.type.options.push({ label: 'Alipay', value: 'alipay' });
    model.fields.alipay_trade_no = {
        label: 'Alipay Trade No',
        type: String,
        protected: true
    };
    model.fields.alipay_buyer_email = {
        label: 'Alipay Buyer Email',
        type: String,
        protected: true
    };
    return model;
}
exports.default = default_1;
