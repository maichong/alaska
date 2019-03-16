import { Sled } from 'alaska-sled';
import User from 'alaska-user/models/User';
import CreateIncome from 'alaska-income/sleds/Create';
import Recharge from '../models/Recharge';
import service, { CompleteParams } from '..';

export default class Complete extends Sled<CompleteParams, Recharge> {
  async exec(params: CompleteParams) {
    const record = params.record as Recharge;
    if (record.state !== 'pending') service.error('Recharge record state error!');

    let user = await User.findById(record.user).session(this.dbSession);
    if (!user) service.error('Recharge user not found!');

    if (!['account', 'deposit'].includes(record.target)) service.error('Invalid recharge target!');

    await CreateIncome.run({
      user,
      title: record.title,
      type: 'recharge',
      amount: record.amount,
      deposit: record.deposit,
      account: record.account
    }, { dbSession: this.dbSession });

    record.state = 'success';
    await record.save({ session: this.dbSession });
    return record;
  }
}
