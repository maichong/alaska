"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const alaska_sled_1 = require("alaska-sled");
const alaska_settings_1 = require("alaska-settings");
const __1 = require("..");
class Pay extends alaska_sled_1.Sled {
    async exec(params) {
        if (this.result)
            return this.result;
        if (!params.record && _.isEmpty(params.records))
            throw new Error('record or records is required');
        let records = _.size(params.records) ? params.records : [params.record];
        if (_.find(records, (o) => ![200].includes(o.state)))
            __1.default.error('Order state error');
        let needConfirm = await alaska_settings_1.default.get('order.needConfirm');
        for (let order of records) {
            let confirm = order.needConfirm;
            if (typeof confirm === 'undefined') {
                confirm = needConfirm;
            }
            order.state = confirm ? 300 : 400;
            order.paymentTimeout = null;
            order.payedAt = new Date();
            await order.save({ session: this.dbSession });
            order.createLog('Order payed', this.dbSession);
        }
        return records;
    }
}
exports.default = Pay;
