// @flow


import alaska, { Sled } from 'alaska';

export default class Complete extends Sled {
  /**
   * @param data
   *        data.payment
   */
  async exec(params: Object) {
    if (!params.done) alaska.error('No valid payment complete hooks');
    let payment = params.payment;
    payment.state = 1;
    await payment.save();
    return payment.toObject();
  }
}
