import { Sled } from 'alaska-sled';
import User from 'alaska-user/models/User';
import CreateIncome from 'alaska-income/sleds/Create';
import Commission from '../models/Commission';
import { BalanceParams } from '..';

export default class Balance extends Sled<BalanceParams, Commission> {
  async exec(params: BalanceParams): Promise<Commission> {
    let commission = params.record as Commission;

    if (commission.state !== 'pending') {
      return commission;
    }

    let user = await User.findById(commission.user).session(this.dbSession);
    if (!user) throw new Error('Can not find user!');

    await CreateIncome.run({
      user,
      title: commission.title,
      account: commission.account,
      amount: commission.amount,
      type: 'commission'
    }, { dbSession: this.dbSession });
    commission.state = 'balanced';
    commission.balancedAt = new Date();

    await commission.save({ session: this.dbSession });
    return commission;
  }
}
