import { Sled } from 'alaska-sled';
import Withdraw from '../models/Withdraw';
import { AcceptParams } from '..';

export default class Accept extends Sled<AcceptParams, Withdraw> {
  async exec(params: AcceptParams): Promise<Withdraw> {
    let record: Withdraw = params.record;
    if (record.state === 0) {
      record.state = 1;
      await record.save({ session: this.dbSession });
    }
    return record;
  }
}
