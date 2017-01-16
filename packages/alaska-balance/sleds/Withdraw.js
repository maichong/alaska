// @flow

import { Sled } from 'alaska';
import WithdrawModel from '../models/Withdraw';
import service from '../';

export default class Withdraw extends Sled {

  /**
   * @param data
   *        data.user
   *        [data.currency]
   *        data.amount
   *        [data.note]
   *        [data.title]
   *        [data.withdraw]  前置钩子中生成的记录
   */
  async exec(data: {
    ctx?:Alaska$Context;
    withdraw?:WithdrawModel;
    title?:string;
    note?:string;
    user:User;
    currency?:string;
    amount:number;
  }): Promise<WithdrawModel> {
    let withdraw: ?Withdraw = data.withdraw;
    if (withdraw) return withdraw;

    let currency = data.currency || service.defaultCurrency.value;
    if (!service.currenciesMap[currency]) service.error('Unknown currency');

    let amount = Math.abs(data.amount) || service.error('Invalid amount');

    let user: User = data.user;

    let balance = user.get(currency);
    if (balance < amount) service.error('Insufficient balance');

    if(amount){
      await user._[currency].income(-amount, data.title || 'Withdraw', 'withdraw');
    }

    const Withdraw = service.model('Withdraw');
    withdraw = new WithdrawModel({
      title: data.title,
      note: data.note,
      user: user._id,
      currency,
      amount
    });
    await withdraw.save();
    return withdraw;
  }
}
