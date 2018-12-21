import { Sled } from 'alaska-sled';
import Withdraw from '../models/Withdraw';
import { WithdrawAcceptParams } from '..';

export default class WithdrawAccept extends Sled<WithdrawAcceptParams, Withdraw> {
  async exec(params: WithdrawAcceptParams): Promise<Withdraw> {
    let record: Withdraw = params.record;
    if (record.state === 0) {
      record.state = 1;
      await record.save();
    }
    return record;
  }
}
