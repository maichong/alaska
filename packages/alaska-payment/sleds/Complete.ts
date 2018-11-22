import { Sled } from 'alaska-sled';
import Payment from '../models/Payment';
import { CompleteParams } from '..';

export default class Complete extends Sled<CompleteParams, Payment> {
  /**
   * @param data
   *        data.payment
   */
  async exec(params: {payment: Payment; done?: boolean}) {
    if (!params.done) this.service.error('No valid payment complete hooks');
    let payment = params.payment;
    payment.state = 1;
    await payment.save();
    return payment.toObject();
  }
}
