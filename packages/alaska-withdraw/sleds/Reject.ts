import { Sled } from 'alaska-sled';
import User from 'alaska-user/models/User';
import CreateIncome from 'alaska-income/sleds/Create';
import Withdraw from '../models/Withdraw';
import service, { RejectParams } from '..';

export default class Reject extends Sled<RejectParams, Withdraw> {
  async exec(params: RejectParams): Promise<Withdraw> {
    let record: Withdraw = params.record;
    if (record.state === 'pending') {
      let reason = params.body.reason || service.error('Missing reject reason');
      record.state = 'rejected';
      if (reason) {
        record.reason = reason;
      }

      await record.save({ session: this.dbSession });

      let user: User = await User.findById(record.user).session(this.dbSession);
      if (user) {
        // 返还、收入
        await CreateIncome.run({
          user,
          amount: record.amount,
          account: record.account,
          title: 'Withdraw Rejected',
          type: 'withdraw_rejected'
        }, { dbSession: this.dbSession });
      }
    } else if (record.state !== 'rejected') {
      service.error('State error');
    }
    return record;
  }
}
