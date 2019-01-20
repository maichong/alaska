import { Sled } from 'alaska-sled';
import RefundModel from '../models/Refund';
import paymentService, { RefundParams } from '..';

export default class Refund extends Sled<RefundParams, RefundModel> {
  async exec(params: RefundParams): Promise<RefundModel> {
    if (this.result) return;
    let refund = params.refund;
    if (!refund) {
      // 前置钩子未生成任何支付记录
      this.service.error('Can not create any refund');
    }
    if (!paymentService.payments[refund.type]) paymentService.error('Unknown payment type');
    await paymentService.payments[refund.type].refund(refund, params.payment);
    await refund.save({ session: this.dbSession });
    return refund;
  }
}
