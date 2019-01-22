import * as _ from 'lodash';
import paymentService from 'alaska-payment';
import Payment from 'alaska-payment/models/Payment';
import Recharge from 'alaska-recharge/models/Recharge';
import BALANCE from 'alaska-balance';
import DepositType from 'alaska-deposit/models/Deposit';

export async function pre() {
  const currenciesMap = BALANCE.currenciesMap;
  let params = this.params;
  // balance | deposit
  let recharge = params.recharge;
  if (!recharge) return;
  let user = params.user || paymentService.error('Missing user info!');
  let type = params.type || paymentService.error('Missing payment type!');
  if (!paymentService.payments[type]) paymentService.error('Unknown payment type!');
  let amount = parseFloat(params.amount) || paymentService.error('Missing payment amount!');
  if (amount <= 0) paymentService.error('Invalid amount!');
  let currency = params.currency || '';
  let deposit = params.deposit;
  let currencyOpt = BALANCE.defaultCurrency;
  // 如果充值目标为余额
  if (recharge === 'balance') {
    // 必须指定currency货币类型
    if (!currency) paymentService.error('Currency is required!');
    if (!currenciesMap.hasOwnProperty(currency)) paymentService.error('Unknown currency type!');
    currencyOpt = currenciesMap[currency];
  } else if (recharge === 'deposit') {
    // 如果充值目标为储值卡，必须指定deposit储值卡ID
    const Deposit = Recharge.lookup('alaska-deposit.Deposit') as typeof DepositType;
    if (!Deposit) paymentService.error('Can not recharge to deposit card!');
    if (!deposit) paymentService.error('Deposit id is required!');
    let dep = await Deposit.findById(deposit).select('title').session(this.dbSession);
    if (!dep) paymentService.error('Deposit record not found!');
    currencyOpt = currenciesMap[dep.currency];
  } else {
    paymentService.error('Invalid recharge target!');
  }

  amount = _.round(amount, currencyOpt.precision);
  if (amount <= 0) paymentService.error('Invalid amount!');

  let record = new Recharge({
    title: params.title || `Recharge-${amount}`,
    user,
    target: recharge,
    currency,
    amount,
    deposit
  });

  let payment = new Payment({
    title: params.title || `Recharge-${amount}`,
    user,
    type,
    amount,
    recharge: record.id
  });

  payment.params = await paymentService.payments[type].createParams(payment);
  await payment.save({ session: this.dbSession });

  record.payment = payment.id;
  await record.save({ session: this.dbSession });
  params.payment = payment;
}
