import * as _ from 'lodash';
import * as moment from 'moment';
import { CurrencyService } from 'alaska-currency';
import paymentService from 'alaska-payment';
import User from 'alaska-user/models/User';
import Payment from 'alaska-payment/models/Payment';
import Recharge from 'alaska-recharge/models/Recharge';
import DepositType from 'alaska-deposit/models/Deposit';
import RechargeRule from '../../../models/RechargeRule';

export async function pre() {
  let params = this.params;
  // account | deposit
  if (!params.recharge) return;
  let user = params.user || paymentService.error('Missing user info!');
  let type = params.type || paymentService.error('Missing payment type!');
  if (!paymentService.payments.has(type)) paymentService.error('Unknown payment type!');
  let paymentAmount = parseFloat(params.amount) || paymentService.error('Missing payment amount!');
  if (paymentAmount <= 0) paymentService.error('Invalid amount!');
  let account = params.account || '';
  let deposit = params.deposit;
  let currencyService = paymentService.main.allServices.get('alaska-currency') as CurrencyService;

  let depositRecord;
  let rechargePrecision: number;
  let rechargeCurrency: string;
  let rechargeAmount = 0;

  let rulesQuery = RechargeRule.find({
    payment: params.type,
    target: params.recharge
  });

  // 如果充值目标为余额
  if (params.recharge === 'account') {
    // 必须指定currency货币类型
    if (!account) paymentService.error('account is required!');
    if (!User._fields.hasOwnProperty(account)) paymentService.error('User account is not exist!');
    if (!User._fields[account].allowRecharge) paymentService.error('User account are not allowed to recharge!');
    rechargeCurrency = User._fields[account].currency;
    rechargePrecision = User._fields[account].precision;
    rulesQuery.where({ rechargeAccount: account });
    deposit = null;
  } else if (params.recharge === 'deposit') {
    // 如果充值目标为储值卡，必须指定deposit储值卡ID
    const Deposit = Recharge.lookup('alaska-deposit.Deposit') as typeof DepositType;
    if (!Deposit) paymentService.error('Can not recharge to deposit card!');
    if (!deposit) paymentService.error('Deposit id is required!');
    depositRecord = await Deposit.findById(deposit).select('title').session(this.dbSession);
    if (!depositRecord) paymentService.error('Deposit record not found!');
    if (depositRecord.expiredAt && moment().isAfter(depositRecord.expiredAt)) paymentService.error('Deposit record has expired');
    rechargeCurrency = depositRecord.currency;
    rechargePrecision = Deposit._fields.balance.precision;
    account = '';
  } else {
    paymentService.error('Invalid recharge target!');
  }

  if (currencyService) {
    rechargeCurrency = rechargeCurrency || currencyService.defaultCurrencyId;
    if (!currencyService.currencies.has(rechargeCurrency)) throw new Error('Currency type net exist!');
    rechargePrecision = currencyService.currencies.get(rechargeCurrency).precision;
    rulesQuery.where({ rechargeCurrency });
  }

  let rules = await rulesQuery;
  // 首先匹配满足条件的，按金额充值规则
  let rule = _.find(rules, (r: RechargeRule) => r.type === 'amount' && r.paymentAmount === paymentAmount && r.rechargeAmount > 0);
  // 其次寻找按比例充值的规则
  if (!rule) rule = _.find(rules, (r: RechargeRule) => r.type === 'rate' && r.rate > 0);
  if (!rule) throw new Error('No availabled recharge rules found!');


  if (rule.type === 'amount') {
    rechargeAmount = rule.rechargeAmount;
  } else {
    rechargeAmount = rule.rate * paymentAmount;
    if (typeof rechargePrecision === 'number') {
      rechargeAmount = _.round(rechargeAmount, rechargePrecision);
    }
  }

  let recharge = new Recharge({
    title: params.title || `Recharge ${rechargeAmount}`,
    user,
    target: params.recharge, // account / deposit
    account,
    deposit,
    currency: rechargeCurrency,
    amount: rechargeAmount
  });

  let payment = new Payment({
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
