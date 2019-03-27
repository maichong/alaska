"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const alaska_sled_1 = require("alaska-sled");
const __1 = require("..");
class Confirm extends alaska_sled_1.Sled {
    async exec(params) {
        if (this.result)
            return this.result;
        if (!params.record && _.isEmpty(params.records))
            throw new Error('record or records is required');
        let records = _.size(params.records) ? params.records : [params.record];
        if (_.find(records, (o) => o.state !== 300))
            __1.default.error('Order state error');
        for (let order of records) {
            order.state = 400;
            await order.save({ session: this.dbSession });
            order.createLog('Order confirmed', this.dbSession);
        }
        return records;
    }
}
exports.default = Confirm;
