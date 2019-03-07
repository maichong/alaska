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

    if (!paymentService.payments.has(payment.type)) paymentService.error('Unknown payment type');
    if (!payment.ip && params.ip) {
      payment.ip = params.ip;
    }
    if (payment.ip === '::1') {
      payment.ip = '127.0.0.1';
    }
    payment.$session(this.dbSession);
    payment.params = await paymentService.payments.get(payment.type).createParams(payment);
    await payment.save({ session: this.dbSession });
    return payment;
  }
}
