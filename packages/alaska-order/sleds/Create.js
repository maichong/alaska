"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const moment = require("moment");
const alaska_sled_1 = require("alaska-sled");
const alaska_settings_1 = require("alaska-settings");
const __1 = require("..");
class Create extends alaska_sled_1.Sled {
    async exec(params) {
        if (this.result)
            return this.result;
        if (!params.record && _.isEmpty(params.records))
            __1.default.error('Can not create any order');
        let records = _.size(params.records) ? params.records : [params.record];
        if (!params.pre) {
            let paymentTimeout = await alaska_settings_1.default.get('order.paymentTimeout');
            for (let order of records) {
                for (let goods of order.goods) {
                    await goods.save({ session: this.dbSession });
                }
                if (paymentTimeout && order.state === 200 && !order.paymentTimeout) {
                    order.paymentTimeout = moment().add(paymentTimeout, 's').toDate();
                }
                order.quantity = order.goods.length;
                await order.save({ session: this.dbSession });
                order.createLog('Order created', this.dbSession);
            }
        }
        return records;
    }
}
exports.default = Create;
