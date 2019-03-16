import * as _ from 'lodash';
import { Sled } from 'alaska-sled';
import { CurrencyService } from 'alaska-currency';
import { DepositService } from 'alaska-deposit';
import User from 'alaska-user/models/User';
import Income from '../models/Income';
import service, { CreateParams } from '..';

export default class Create extends Sled<CreateParams, Income> {
  async exec(params: CreateParams): Promise<Income> {
    let { user, type, deposit, account, title, amount } = params;

    amount = Number(amount);
    if (Number.isNaN(amount)) throw new Error('Invalid amount for create income record!');

    let precision: number;
    let currency: string;
    let depositRecord;
    let balance: number;
    let target = 'balance';

    if (deposit) {
      target = 'deposit';
      let depositService = service.main.allServices.get('alaska-deposit') as DepositService;
      if (!depositService) throw new Error('Deposit service not found!');
      depositRecord = await depositService.models.Deposit.findById(deposit).where({ user: user._id }).session(this.dbSession);
      if (!depositRecord) throw new Error('Deposit not found!');
      currency = depositRecord.currency;
      balance = depositRecord.balance + amount;
    } else {
      if (!account) throw new Error('account or deposit is required for create income record!');
      if (!User._fields.hasOwnProperty(account)) throw new Error(`User.fields.${account} is not exist!`);
      currency = User._fields[account].currency;
      balance = (user.get(account) + amount) || 0;
    }

    let currencyService = service.main.allServices.get('alaska-currency') as CurrencyService;
    if (currencyService) {
      if (!currency) currency = currencyService.defaultCurrencyId;
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
    } else {
      user.set(account, balance);
      await user.save({ session: this.dbSession });
    }

    let income = new Income({
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
