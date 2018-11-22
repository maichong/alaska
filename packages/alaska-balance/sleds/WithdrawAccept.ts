import { Sled } from 'alaska-sled';
import Withdraw from '../models/Withdraw';
import { WithdrawAcceptParams } from '..';

export default class WithdrawAccept extends Sled<WithdrawAcceptParams, Object> {
  async exec(params: WithdrawAcceptParams): Promise<Object> {
    let withdraw: Withdraw = params.withdraw;
    if (withdraw.state === 0) {
      withdraw.state = 1;
      await withdraw.save();
    }
    return withdraw.toObject();
  }
}
