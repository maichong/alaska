"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const alaska_sled_1 = require("alaska-sled");
const User_1 = require("alaska-user/models/User");
const __1 = require("..");
class Timeout extends alaska_sled_1.Sled {
    async exec(params) {
        if (this.result)
            return this.result;
        if (!params.record && _.isEmpty(params.records))
            throw new Error('record or records is required');
        let records = _.size(params.records) ? params.records : [params.record];
        if (_.find(records, (o) => ![200].includes(o.state)))
            __1.default.error('Order state error');
        const incomeService = __1.default.lookup('alaska-income');
        for (let order of records) {
            order.state = 900;
            if (!order.failure) {
                order.failure = 'Timeout';
            }
            await order.save({ session: this.dbSession });
            order.createLog('Order timeout', this.dbSession);
            if (incomeService && order.deductionAmount && order.deductionAccount) {
                let user = await User_1.default.findById(order.user).session(this.dbSession);
                await incomeService.sleds.Create.run({
                    user,
                    title: 'Order timeout',
                    type: 'refund',
                    amount: order.deductionAmount,
                    account: order.deductionAccount
                }, { dbSession: this.dbSession });
            }
        }
        return records;
    }
}
exports.default = Timeout;
