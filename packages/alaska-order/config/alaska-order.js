"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const _ = require("lodash");
const Order_1 = require("../models/Order");
exports.default = {
    prefix: '',
    services: {
        'alaska-user': {},
        'alaska-settings': {},
        'alaska-payment': {
            optional: true
        }
    },
    codeRandomLength: 6,
    codeCreator: async (order) => {
        while (true) {
            let code = moment(order.createdAt).format('YYMMDD');
            let max = await Order_1.default.findOne({ code: new RegExp(`^${code}`) }).sort('-code').select('code');
            let num = max ? parseInt(max.code.substr(6)) : 0;
            num += _.random(1, 20);
            code += _.padStart(num.toString(), Order_1.default.service.config.get('codeRandomLength'), '0');
            let old = await Order_1.default.findOne({ code }).select('_id');
            if (!old) {
                return code;
            }
        }
    }
};
