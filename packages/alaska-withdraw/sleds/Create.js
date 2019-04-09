"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_sled_1 = require("alaska-sled");
const User_1 = require("alaska-user/models/User");
const Create_1 = require("alaska-income/sleds/Create");
const Withdraw_1 = require("../models/Withdraw");
const __1 = require("..");
class Create extends alaska_sled_1.Sled {
    async exec(params) {
        if (this.result)
            return this.result;
        let account = params.account;
        if (!account || !User_1.default._fields.hasOwnProperty(account))
            __1.default.error('Invalid account for withdraw!');
        let amount = Math.abs(params.amount) || __1.default.error('Invalid amount for withdraw!');
        let user = params.user;
        let balance = user.get(account);
        if (balance < amount)
            __1.default.error('Insufficient balance');
        let income = await Create_1.default.run({
            user,
            title: params.title || 'Withdraw',
            type: 'withdraw',
            account,
            amount: -amount
        }, { dbSession: this.dbSession });
        let withdraw = new Withdraw_1.default({
            title: params.title,
            remark: params.remark,
            type: params.type,
            user: user._id,
            openid: params.openid,
            alipay: params.alipay,
            realName: params.realName,
            currency: income.currency,
            account,
            amount
        });
        if (withdraw.ip === '::1') {
            withdraw.ip = '127.0.0.1';
        }
        await withdraw.save({ session: this.dbSession });
        return withdraw;
    }
}
exports.default = Create;
