import { Sled } from 'alaska-sled';
import Payment from '../models/Payment';
import { CompleteParams } from '..';

export default class Complete extends Sled<CompleteParams, Payment> {
  /**
   * @param data
   *        data.payment
   */
  async exec(params: CompleteParams) {
    if (this.result) return;
    if (!params.done) this.service.error('No valid payment complete hooks');
    let record = params.record;
    record.state = 1;
    await record.save({ session: this.dbSession });
    return record;
  }
}
