import { Sled } from 'alaska-sled';
import User from 'alaska-user/models/User';
import CreateIncome from 'alaska-income/sleds/Create';
import Withdraw from '../models/Withdraw';
import service, { CreateParams } from '..';

export default class Create extends Sled<CreateParams, Withdraw> {
  async exec(params: CreateParams): Promise<Withdraw> {
    if (this.result) return this.result;

    let account = params.account;
    if (!account || !User._fields.hasOwnProperty(account)) service.error('Invalid account for withdraw!');

    let amount = Math.abs(params.amount) || service.error('Invalid amount for withdraw!');

    let user: User = params.user;

    let balance = user.get(account);
    if (balance < amount) service.error('Insufficient balance');

    let income = await CreateIncome.run({
      user,
      title: params.title || 'Withdraw',
      type: 'withdraw',
      account,
      amount: -amount
    }, { dbSession: this.dbSession });

    let withdraw = new Withdraw({
      title: params.title,
      note: params.note,
      user: user._id,
      currency: income.currency,
      account,
      amount
    });
    await withdraw.save({ session: this.dbSession });
    return withdraw;
  }
}
