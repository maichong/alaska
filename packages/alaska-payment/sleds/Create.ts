import { Sled } from 'alaska-sled';
import Payment from '../models/Payment';
import { CreateParams } from '..';

export default class Create extends Sled<CreateParams, Payment> {
  async exec(params: CreateParams): Promise<Payment> {
    let payment = params.payment;
    if (!payment) {
      //前置钩子未生成任何支付记录
      this.service.error('Can not create any payment');
    }
    return payment;
  }
}
