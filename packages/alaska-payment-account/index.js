"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const User_1 = require("alaska-user/models/User");
const Create_1 = require("alaska-income/sleds/Create");
const alaska_payment_1 = require("alaska-payment");
class AccountPaymentPlugin extends alaska_payment_1.PaymentPlugin {
    constructor(pluginConfig, service) {
        super(pluginConfig, service);
        if (_.isEmpty(pluginConfig.channels))
            throw new Error(`Missing config [alaska-payment/plugins.alaska-payment-account.channels]`);
        this.configs = new Map();
        for (let account of _.keys(pluginConfig.channels)) {
            let options = {
                account
            };
            this.configs.set(`account:${account}`, options);
            service.paymentPlugins.set(`account:${account}`, this);
        }
    }
    async createParams(payment) {
        const options = this.configs.get(payment.type);
        const account = options.account;
        if (!User_1.default._fields.hasOwnProperty(account))
            throw new Error(`User account field "${account}" not found!`);
        let currency = User_1.default._fields[account].currency;
        let currencyService = this.service.lookup('alaska-currency');
        if (currencyService) {
            currency = currency || currencyService.defaultCurrencyId;
            if (payment.currency && currency !== payment.currency)
                throw new Error('Payment currency not match!');
        }
        let user;
        if (payment.populated('user')) {
            user = payment.user;
        }
        else {
            user = await User_1.default.findById(payment.user).session(payment.$session());
        }
        if (!user) {
            throw new Error('Unknown user for payment');
        }
        let balance = user.get(account) || 0;
        if (balance < payment.amount) {
            this.service.error('Insufficient balance');
        }
        await Create_1.default.run({
            user,
            amount: -payment.amount,
            title: payment.title,
            type: 'payment',
            account
        }, { dbSession: payment.$session() });
        payment.currency = currency;
        payment.state = 'success';
        return 'success';
    }
    async refund(refund, payment) {
        const options = this.configs.get(payment.type);
        const account = options.account;
        if (!User_1.default._fields.hasOwnProperty(account))
            throw new Error(`User account field "${account}" not found!`);
        let currency = User_1.default._fields[account].currency;
        let currencyService = this.service.lookup('alaska-currency');
        if (currencyService) {
            currency = currency || currencyService.defaultCurrencyId;
            if (payment.currency && currency !== payment.currency)
                throw new Error('Payment currency not match!');
        }
        let user;
        if (refund.populated('user')) {
            user = refund.user;
        }
        else {
            user = await User_1.default.findById(refund.user);
        }
        if (!user) {
            throw new Error('Unknown user for refund');
        }
        await Create_1.default.run({
            user,
            amount: refund.amount,
            title: refund.title,
            type: 'refund',
            account
        }, { dbSession: refund.$session() || payment.$session() });
        refund.currency = currency;
        refund.state = 'success';
    }
}
exports.default = AccountPaymentPlugin;
