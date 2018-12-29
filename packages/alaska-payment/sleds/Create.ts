import { Sled } from 'alaska-sled';
import Payment from '../models/Payment';
import paymentService, { CreateParams } from '..';

export default class Create extends Sled<CreateParams, Payment> {
  async exec(params: CreateParams): Promise<Payment> {
    if (this.result) return;
    let payment = params.payment;
    if (!payment) {
      // 前置钩子未生成任何支付记录
      paymentService.error('Can not create any payment');
    }

    if (!paymentService.payments[payment.type]) paymentService.error('Unknown payment type');
    payment.params = await paymentService.payments[payment.type].createParams(payment);
    await payment.save();
    return payment;
  }
}
