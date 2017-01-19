// @flow

import { Sled } from 'alaska';
import WithdrawModel from '../models/Withdraw';
import service from '../';

export default class Withdraw extends Sled {

  /**
   * @param params
   *        params.user
   *        [params.currency]
   *        params.amount
   *        [params.note]
   *        [params.title]
   *        [params.withdraw]  前置钩子中生成的记录
   */
  async exec(params: {
    ctx?:Alaska$Context;
    withdraw?:WithdrawModel;
    title?:string;
    note?:string;
    user:User;
    currency?:string;
    amount:number;
  }): Promise<WithdrawModel> {
    let withdraw: ?WithdrawModel = params.withdraw;
    if (withdraw) return withdraw;

    let currency = params.currency || service.defaultCurrency.value;

    if (!service.currenciesMap[currency]) service.error('Unknown currency');

    let amount = Math.abs(params.amount) || service.error('Invalid amount');

    let user: User = params.user;

    let balance = user.get(currency.toString());
    if (balance < amount) service.error('Insufficient balance');

    if (amount) {
      await user._[currency.toString()].income(-amount, params.title || 'Withdraw', 'withdraw');
    }

    withdraw = new WithdrawModel({
      title: params.title,
      note: params.note,
      user: user._id,
      currency,
      amount
    });
    await withdraw.save();
    return withdraw;
  }
}
