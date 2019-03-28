"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const alaska_sled_1 = require("alaska-sled");
const User_1 = require("alaska-user/models/User");
const Income_1 = require("../models/Income");
const __1 = require("..");
class Create extends alaska_sled_1.Sled {
    async exec(params) {
        let { user, type, deposit, account, title, amount } = params;
        amount = Number(amount);
        if (Number.isNaN(amount))
            throw new Error('Invalid amount for create income record!');
        let precision;
        let currency;
        let depositRecord;
        let balance;
        let target = 'account';
        if (deposit) {
            target = 'deposit';
            let depositService = __1.default.lookup('alaska-deposit');
            if (!depositService)
                throw new Error('Deposit service not found!');
            depositRecord = await depositService.models.Deposit.findById(deposit).where({ user: user._id }).session(this.dbSession);
            if (!depositRecord)
                throw new Error('Deposit not found!');
            currency = depositRecord.currency;
            balance = depositRecord.balance + amount;
        }
        else {
            if (!account)
                throw new Error('account or deposit is required for create income record!');
            if (!User_1.default._fields.hasOwnProperty(account))
                throw new Error(`User.fields.${account} is not exist!`);
            currency = User_1.default._fields[account].currency;
            balance = (user.get(account) + amount) || 0;
        }
        let currencyService = __1.default.lookup('alaska-currency');
        if (currencyService) {
            if (!currency)
                currency = currencyService.defaultCurrencyId;
            let c = currencyService.currencies.get(currency);
            if (c) {
                precision = c.precision;
            }
        }
        if (typeof precision === 'number') {
            amount = _.round(amount, precision);
            balance = _.round(balance, precision);
        }
        if (deposit) {
            depositRecord.balance = balance;
            await depositRecord.save({ session: this.dbSession });
        }
        else {
            user.set(account, balance);
            await user.save({ session: this.dbSession });
        }
        let income = new Income_1.default({
            type,
            title,
            amount,
            balance,
            target,
            currency,
            user: user._id
        });
        await income.save({ session: this.dbSession });
        return income;
    }
}
exports.default = Create;
