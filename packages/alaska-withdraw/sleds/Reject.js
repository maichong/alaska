"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_sled_1 = require("alaska-sled");
const User_1 = require("alaska-user/models/User");
const Create_1 = require("alaska-income/sleds/Create");
const __1 = require("..");
class Reject extends alaska_sled_1.Sled {
    async exec(params) {
        let record = params.record;
        if (record.state === 'pending') {
            let reason = params.body.reason || __1.default.error('Missing reject reason');
            record.state = 'rejected';
            if (reason) {
                record.reason = reason;
            }
            await record.save({ session: this.dbSession });
            let user = await User_1.default.findById(record.user).session(this.dbSession);
            if (user) {
                await Create_1.default.run({
                    user,
                    amount: record.amount,
                    account: record.account,
                    title: 'Withdraw Rejected',
                    type: 'withdraw_rejected'
                }, { dbSession: this.dbSession });
            }
        }
        else if (record.state !== 'rejected') {
            __1.default.error('State error');
        }
        return record;
    }
}
exports.default = Reject;
