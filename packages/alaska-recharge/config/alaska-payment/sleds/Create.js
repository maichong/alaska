// @Flow

import _ from 'lodash';
import service from 'alaska-payment';
import Payment from 'alaska-payment/models/Payment';
import Recharge from 'alaska-recharge/models/Recharge';
import BALANCE from 'alaska-balance';
import Deposit from 'alaska-balance/models/Deposit';

const currenciesMap = BALANCE.currenciesMap;

export async function pre() {
  let params = this.params;
  console.log('params', params);
  // balance | deposit
  let recharge = params.recharge;
  if (!recharge) return;
  let user = params.user || service.error('Missing user info!');
  let type = params.type || service.error('Missing payment type!');
  if (!service.payments[type]) service.error('Unknown payment type!');
  let amount = parseFloat(params.amount) || service.error('Missing payment amount!');
  if (amount <= 0) service.error('Invalid amount!');
  let currency = params.currency || '';
  let deposit = params.deposit || undefined;
  let currencyOpt = BALANCE.defaultCurrency;
  // 如果充值目标为余额
  if (recharge === 'balance') {
    // 必须指定currency货币类型
    if (!currency) service.error('Currency is required!');
    if (!currenciesMap.hasOwnProperty(currency)) service.error('Unknown currency type!');
    currencyOpt = currenciesMap[currency];
  }
  // 如果充值目标为储值卡，必须指定deposit储值卡ID
  if (recharge === 'deposit') {
    if (!deposit) service.error('Deposit id is required!');
    let dep = await Deposit.findById(deposit).select('title');
    if (!dep) service.error('Deposit record not found!');
    currencyOpt = currenciesMap[dep.currency];
  }

  if (currencyOpt.precision !== undefined) {
    amount = _.round(amount);
  }
  if (amount <= 0) service.error('Invalid amount!');

  let record = new Recharge({
    title: params.title || 'Recharge-' + amount,
    user,
    target: recharge,
    currency,
    amount,
    deposit
  });

  let payment = new Payment({
    title: params.title || 'Recharge-' + amount,
    user,
    type,
    amount,
    recharge: record.id
  });

  payment.params = await service.payments[type].createParams(payment);
  await payment.save();

  record.payment = payment.id;
  await record.save();
  params.payment = payment;
}
