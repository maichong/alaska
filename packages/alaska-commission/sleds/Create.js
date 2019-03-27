"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const alaska_sled_1 = require("alaska-sled");
const User_1 = require("alaska-user/models/User");
const __1 = require("..");
const Commission_1 = require("../models/Commission");
const Balance_1 = require("./Balance");
class Create extends alaska_sled_1.Sled {
    async exec(p) {
        let { user, account, title, order, contributor, amount, price, rate, level, main, fields } = p;
        if (!user)
            throw new Error('user is required for create commission!');
        if (!User_1.default._fields.hasOwnProperty(account))
            throw new Error(`account "${account}" not found!`);
        let currency = User_1.default._fields[account].currency;
        let precision = User_1.default._fields[account].precision;
        const commissionRates = __1.default.config.get('commissionRates');
        const currencyService = __1.default.lookup('alaska-currency');
        if (currencyService) {
            currency = currency || currencyService.defaultCurrencyId;
            if (!currencyService.currencies.has(currency))
                throw new Error(`currency "${currency}" not found!`);
            precision = currencyService.currencies.get(currency).precision;
        }
        level = level || 1;
        title = title || (order && order.title) || '';
        contributor = contributor || (order && order.user) || null;
        price = price || (order && order.payed) || 0;
        if (!amount && amount !== 0) {
            if (!price)
                throw new Error('amount or price is required for create commission!');
            if (!rate) {
                rate = commissionRates[level - 1];
            }
            if (!rate)
                throw new Error('can not determine commission rate!');
            amount = rate * price;
            if (typeof precision === 'number') {
                amount = _.round(amount, precision);
            }
        }
        let userRecord;
        if (user.save) {
            userRecord = user;
        }
        else {
            userRecord = await User_1.default.findById(user).session(this.dbSession);
            if (!userRecord)
                throw new Error('User record not found!');
        }
        userRecord.commissionAmount += amount;
        await userRecord.save({ session: this.dbSession });
        let contributorUser;
        if (contributor && contributor.save) {
            contributorUser = contributor;
        }
        else if (contributor) {
            contributorUser = await User_1.default.findById(contributor).session(this.dbSession);
        }
        if (contributorUser) {
            contributorUser.promoterCommissionAmount += amount;
            await contributorUser.save({ session: this.dbSession });
        }
        let commission = new Commission_1.default({
            user,
            title,
            account,
            currency,
            amount,
            contributor,
            order,
            level,
            main
        });
        if (fields) {
            _.forEach(fields, (v, k) => {
                commission.set(k, v);
            });
        }
        await commission.save({ session: this.dbSession });
        if (p.balance) {
            await Balance_1.default.run({ record: commission }, { dbSession: this.dbSession });
        }
        let results = [commission];
        if (commissionRates.length > level && price) {
            let u = user;
            if (!u.save) {
                u = await User_1.default.findById(user);
            }
            if (u && u.promoter) {
                let list = await Create.run({
                    user: u.promoter,
                    level: level + 1,
                    amount: 0,
                    price,
                    contributor: contributorUser || contributor,
                    rate: 0,
                    title,
                    order,
                    account,
                    main: main || commission._id
                }, { dbSession: this.dbSession });
                results.push(...list);
            }
        }
        return results;
    }
}
exports.default = Create;
