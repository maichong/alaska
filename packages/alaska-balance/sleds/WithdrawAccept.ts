import { Sled } from 'alaska-sled';
import Withdraw from '../models/Withdraw';
import { WithdrawAcceptParams } from '..';

export default class WithdrawAccept extends Sled<WithdrawAcceptParams, Object> {
  async exec(params: WithdrawAcceptParams): Promise<Object> {
    let record: Withdraw = params.records[0];
    if (record.state === 0) {
      record.state = 1;
      await record.save();
    }
    return record.toObject();
  }
}
