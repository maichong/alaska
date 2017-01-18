// @flow

import alaska, { Sled } from 'alaska';

export default class Create extends Sled {
  async exec(params: Object) {
    let payment = params.payment;
    if (!payment) {
      //前置钩子未生成任何支付记录
      alaska.error('Can not create any payment');
    }
    return payment;
  }
}
