// @Flow

import { Sled } from 'alaska';
import User from 'alaska-user/models/User';
import BALANCE from 'alaska-balance';
import Deposit from 'alaska-balance/models/Deposit';
import Income from 'alaska-balance/models/Income';
import service from '../';

export default class Complete extends Sled {
  async exec(params: {
    recharge: Object
  }) {
    const currenciesMap = BALANCE.currenciesMap;
    let recharge = params.recharge;
    if (recharge.state !== 0) service.error('Recharge record state error!');

    let income = new Income({
      title: recharge.title,
      type: 'recharge',
      user: recharge.user,
      amount: recharge.amount,
      target: recharge.target,
      current: recharge.currency
    });
    if (recharge.target === 'balance') {
      let currency = recharge.currency;
      let currencyOpt = currenciesMap[currency];
      if (!currencyOpt || !currencyOpt.value) {
        service.error('Unknown currency!');
      }
      let user = await User.findById(recharge.user);
      if (!user) service.error('Recharge user not found!');
      let balance = parseFloat(user.get(currency)) || 0;
      balance += recharge.amount;
      user.set(currency, balance);
      await user.save();
      income.balance = balance;
      await income.save();
    } else if (recharge.target === 'deposit') {
      let deposit = await Deposit.findById(recharge.deposit);
      if (!deposit) service.error('Can not find deposit!');
      deposit.balance += recharge.amount;
      await deposit.save();
      income.currency = deposit.currency;
      income.balance = deposit.balance;
      income.deposit = deposit.id;
      await income.save();
    } else {
      service.error('In valid recharge target');
    }

    recharge.state = 1;
    await recharge.save();
  }
}
