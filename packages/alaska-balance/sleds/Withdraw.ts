import { Sled } from 'alaska-sled';
import User from 'alaska-user/models/User';
import WithdrawModel from '../models/Withdraw';
import service, { WithdrawParams, CreateIncome } from '..';

export default class Withdraw extends Sled<WithdrawParams, WithdrawModel> {
  /**
   * 提现
   * @param {Object} params
   * @param {Context} params.ctx
   * @param {WithdrawModel} [params.withdraw] 前置钩子中生成的记录
   * @param {string} [params.title]
   * @param {string} [params.note]
   * @param {User} params.user
   * @param {Object} [params.currency]
   * @param {number} params.amount
   */
  async exec(params: WithdrawParams): Promise<WithdrawModel> {
    let withdraw: WithdrawModel = params.withdraw;
    if (withdraw) return withdraw;

    let currency = params.currency || service.defaultCurrency.value;

    if (!service.currenciesMap[currency]) service.error('Unknown currency');

    let amount = Math.abs(params.amount) || service.error('Invalid amount');

    let user: User = params.user;

    let balance = user.get(currency.toString());
    if (balance < amount) service.error('Insufficient balance');

    if (amount) {
      await (user._[currency.toString()].income as CreateIncome)(-amount, params.title || 'Withdraw', 'withdraw', this.dbSession);
    }

    withdraw = new WithdrawModel({
      title: params.title,
      note: params.note,
      user: user._id,
      currency,
      amount
    });
    await withdraw.save({ session: this.dbSession });
    return withdraw;
  }
}
