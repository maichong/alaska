import { Sled } from 'alaska-sled';
import Withdraw from '../models/Withdraw';
import withdrawService, { AcceptParams } from '..';

export default class Accept extends Sled<AcceptParams, Withdraw> {
  async exec(params: AcceptParams): Promise<Withdraw> {
    let record: Withdraw = params.record;
    if (record.state === 'pending') {
      let plugin = withdrawService.withdrawPlugins.get(record.type);
      if (!plugin) withdrawService.error('Withdraw plugin not found');
      await plugin.withdraw(record);
      record.state = 'accepted';
      await record.save({ session: this.dbSession });
    }
    return record;
  }
}
