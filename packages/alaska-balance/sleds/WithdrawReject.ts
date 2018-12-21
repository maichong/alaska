import { Sled } from 'alaska-sled';
import User from 'alaska-user/models/User';
import Withdraw from '../models/Withdraw';
import service, { WithdrawRejectParams } from '..';

export default class WithdrawReject extends Sled<WithdrawRejectParams, Withdraw> {
  async exec(params: WithdrawRejectParams): Promise<Withdraw> {
    let record: Withdraw = params.record;
    if (record.state === 0) {
      let reason = params.body.reason || service.error('Missing reject reason');
      record.state = -1;
      if (reason) {
        record.reason = reason;
      }

      await record.save();

      let user: User = await User.findById(record.user);
      if (user) {
        await user._[record.currency].income(record.amount, 'Withdraw Rejected', 'withdraw_rejected');
      }
    } else if (record.state !== -1) {
      service.error('State error');
    }
    return record;
  }
}
