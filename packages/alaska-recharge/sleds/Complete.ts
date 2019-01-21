import { Sled } from 'alaska-sled';
import User from 'alaska-user/models/User';
import balanceService from 'alaska-balance';
import DepositType from 'alaska-deposit/models/Deposit';
import Income from 'alaska-balance/models/Income';
import Recharge from '../models/Recharge';
import service, { CompleteParams } from '..';

export default class Complete extends Sled<CompleteParams, Recharge> {
  async exec(params: CompleteParams) {
    const currenciesMap = balanceService.currenciesMap;
    const record = params.record as Recharge;
    if (record.state !== 0) service.error('Recharge record state error!');

    let income = new Income({
      title: record.title,
      type: 'recharge',
      user: record.user,
      amount: record.amount,
      target: record.target,
      current: record.currency
    });
    if (record.target === 'balance') {
      let currency = record.currency;
      let currencyOpt = currenciesMap[currency];
      if (!currencyOpt || !currencyOpt.value) {
        service.error('Unknown currency!');
      }
      let user = await User.findById(record.user).session(this.dbSession);
      if (!user) service.error('Recharge user not found!');
      let balance = parseFloat(user.get(currency)) || 0;
      balance += record.amount;
      user.set(currency, balance);
      await user.save({ session: this.dbSession });
      income.balance = balance;
      await income.save({ session: this.dbSession });
    } else if (record.target === 'deposit') {
      const Deposit = Recharge.lookup('alaska-deposit.Deposit') as typeof DepositType;
      if (!Deposit) service.error('Can not recharge to deposit card!');
      let deposit = await Deposit.findById(record.deposit).session(this.dbSession);
      if (!deposit) service.error('Can not find deposit!');
      deposit.balance += record.amount;
      await deposit.save({ session: this.dbSession });
      income.currency = deposit.currency;
      income.balance = deposit.balance;
      income.deposit = deposit.id;
      await income.save({ session: this.dbSession });
    } else {
      service.error('Invalid recharge target!');
    }

    record.state = 1;
    await record.save({ session: this.dbSession });
    return record;
  }
}
