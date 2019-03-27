"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_sled_1 = require("alaska-sled");
const User_1 = require("alaska-user/models/User");
const Create_1 = require("alaska-income/sleds/Create");
const __1 = require("..");
class Complete extends alaska_sled_1.Sled {
    async exec(params) {
        const record = params.record;
        if (record.state !== 'pending')
            __1.default.error('Recharge record state error!');
        let user = await User_1.default.findById(record.user).session(this.dbSession);
        if (!user)
            __1.default.error('Recharge user not found!');
        if (!['account', 'deposit'].includes(record.target))
            __1.default.error('Invalid recharge target!');
        await Create_1.default.run({
            user,
            title: record.title,
            type: 'recharge',
            amount: record.amount,
            deposit: record.deposit,
            account: record.account
        }, { dbSession: this.dbSession });
        record.state = 'success';
        await record.save({ session: this.dbSession });
        return record;
    }
}
exports.default = Complete;
