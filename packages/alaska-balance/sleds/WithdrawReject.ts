import { Sled } from 'alaska-sled';
import User from 'alaska-user/models/User';
import Withdraw from '../models/Withdraw';
import service, { WithdrawRejectParams } from '..';

export default class WithdrawReject extends Sled<WithdrawRejectParams, Object> {
  async exec(params: WithdrawRejectParams): Promise<Object> {
    let withdraw: Withdraw = params.withdraw;
    if (withdraw.state === 0) {
      let reason = params.body.reason || service.error('Missing reject reason');
      withdraw.state = -1;
      if (reason) {
        withdraw.reason = reason;
      }

      await withdraw.save();

      let user: User = await User.findById(withdraw.user);
      if (user) {
        await user._[withdraw.currency].income(withdraw.amount, 'Withdraw Rejected', 'withdraw_rejected');
      }
    } else if (withdraw.state !== -1) {
      service.error('State error');
    }
    return withdraw.toObject();
  }
}
