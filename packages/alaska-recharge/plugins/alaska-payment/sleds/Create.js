"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const moment = require("moment");
const alaska_payment_1 = require("alaska-payment");
const User_1 = require("alaska-user/models/User");
const Payment_1 = require("alaska-payment/models/Payment");
const Recharge_1 = require("alaska-recharge/models/Recharge");
const RechargeRule_1 = require("../../../models/RechargeRule");
async function pre() {
    let params = this.params;
    if (!params.recharge)
        return;
    let user = params.user || alaska_payment_1.default.error('Missing user info!');
    let type = params.type || alaska_payment_1.default.error('Missing payment type!');
    if (!alaska_payment_1.default.payments.has(type))
        alaska_payment_1.default.error('Unknown payment type!');
    let paymentAmount = parseFloat(params.amount) || alaska_payment_1.default.error('Missing payment amount!');
    if (paymentAmount <= 0)
        alaska_payment_1.default.error('Invalid amount!');
    let account = params.account || '';
    let deposit = params.deposit;
    let currencyService = alaska_payment_1.default.main.allServices.get('alaska-currency');
    let depositRecord;
    let rechargePrecision;
    let rechargeCurrency;
    let rechargeAmount = 0;
    let rulesQuery = RechargeRule_1.default.find({
        payment: params.type,
        target: params.recharge
    });
    if (params.recharge === 'account') {
        if (!account)
            alaska_payment_1.default.error('account is required!');
        if (!User_1.default._fields.hasOwnProperty(account))
            alaska_payment_1.default.error('User account is not exist!');
        if (!User_1.default._fields[account].allowRecharge)
            alaska_payment_1.default.error('User account are not allowed to recharge!');
        rechargeCurrency = User_1.default._fields[account].currency;
        rechargePrecision = User_1.default._fields[account].precision;
        rulesQuery.where({ rechargeAccount: account });
        deposit = null;
    }
    else if (params.recharge === 'deposit') {
        const Deposit = Recharge_1.default.lookup('alaska-deposit.Deposit');
        if (!Deposit)
            alaska_payment_1.default.error('Can not recharge to deposit card!');
        if (!deposit)
            alaska_payment_1.default.error('Deposit id is required!');
        depositRecord = await Deposit.findById(deposit).select('title').session(this.dbSession);
        if (!depositRecord)
            alaska_payment_1.default.error('Deposit record not found!');
        if (depositRecord.expiredAt && moment().isAfter(depositRecord.expiredAt))
            alaska_payment_1.default.error('Deposit record has expired');
        rechargeCurrency = depositRecord.currency;
        rechargePrecision = Deposit._fields.balance.precision;
        account = '';
    }
    else {
        alaska_payment_1.default.error('Invalid recharge target!');
    }
    if (currencyService) {
        rechargeCurrency = rechargeCurrency || currencyService.defaultCurrencyId;
        if (!currencyService.currencies.has(rechargeCurrency))
            throw new Error('Currency type net exist!');
        rechargePrecision = currencyService.currencies.get(rechargeCurrency).precision;
        rulesQuery.where({ rechargeCurrency });
    }
    let rules = await rulesQuery;
    let rule = _.find(rules, (r) => r.type === 'amount' && r.paymentAmount === paymentAmount && r.rechargeAmount > 0);
    if (!rule)
        rule = _.find(rules, (r) => r.type === 'rate' && r.rate > 0);
    if (!rule)
        throw new Error('No availabled recharge rules found!');
    if (rule.type === 'amount') {
        rechargeAmount = rule.rechargeAmount;
    }
    else {
        rechargeAmount = rule.rate * paymentAmount;
        if (typeof rechargePrecision === 'number') {
            rechargeAmount = _.round(rechargeAmount, rechargePrecision);
        }
    }
    let recharge = new Recharge_1.default({
        title: params.title || `Recharge ${rechargeAmount}`,
        user,
        target: params.recharge,
        account,
        deposit,
        currency: rechargeCurrency,
        amount: rechargeAmount
    });
    let payment = new Payment_1.default({
        title: params.title || `Recharge ${paymentAmount}`,
        user,
        type,
        currency: rule.paymentCurrency,
        amount: paymentAmount,
        recharge: recharge.id
    });
    recharge.payment = payment.id;
    await recharge.save({ session: this.dbSession });
    params.payment = payment;
}
exports.pre = pre;
