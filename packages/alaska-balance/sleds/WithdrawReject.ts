import { Sled } from 'alaska-sled';
import User from 'alaska-user/models/User';
import Withdraw from '../models/Withdraw';
import service, { WithdrawRejectParams, CreateIncome } from '..';

export default class WithdrawReject extends Sled<WithdrawRejectParams, Withdraw> {
  async exec(params: WithdrawRejectParams): Promise<Withdraw> {
    let record: Withdraw = params.record;
    if (record.state === 0) {
      let reason = params.body.reason || service.error('Missing reject reason');
      record.state = -1;
      if (reason) {
        record.reason = reason;
      }

      await record.save({ session: this.dbSession });

      let user: User = await User.findById(record.user).session(this.dbSession);
      if (user) {
        await (user._[record.currency].income as CreateIncome)(record.amount, 'Withdraw Rejected', 'withdraw_rejected', this.dbSession);
      }
    } else if (record.state !== -1) {
      service.error('State error');
    }
    return record;
  }
}
