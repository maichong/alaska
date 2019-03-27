"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_sled_1 = require("alaska-sled");
const User_1 = require("alaska-user/models/User");
const Create_1 = require("alaska-income/sleds/Create");
class Balance extends alaska_sled_1.Sled {
    async exec(params) {
        let commission = params.record;
        if (commission.state !== 'pending') {
            return commission;
        }
        let user = await User_1.default.findById(commission.user).session(this.dbSession);
        if (!user)
            throw new Error('Can not find user!');
        await Create_1.default.run({
            user,
            title: commission.title,
            account: commission.account,
            amount: commission.amount,
            type: 'commission'
        }, { dbSession: this.dbSession });
        commission.state = 'balanced';
        commission.balancedAt = new Date();
        await commission.save({ session: this.dbSession });
        return commission;
    }
}
exports.default = Balance;
