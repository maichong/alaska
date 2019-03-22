import * as _ from 'lodash';
import { Sled } from 'alaska-sled';
import { PaymentService } from 'alaska-payment';
import Order from '../models/Order';
import service, { RejectParams } from '..';

/**
 * 商家拒绝订单，订单审核失败
 * 300 -> 900
 */
export default class Reject extends Sled<RejectParams, Order[]> {
  async exec(params: RejectParams): Promise<Order[]> {
    if (this.result) return this.result; // 在前置插件中已经处理
    if (!params.record && _.isEmpty(params.records)) throw new Error('record or records is required');
    let records = _.size(params.records) ? params.records : [params.record];
    if (_.find(records, (o: Order) => ![300].includes(o.state))) service.error('Order state error');

    const paymentService = service.lookup('alaska-payment') as PaymentService;

    for (let order of records) {
      order.state = 900;
      if (!order.failure) {
        order.failure = 'Rejected';
      }
      await order.save({ session: this.dbSession });
      order.createLog('Order rejected', this.dbSession);

      // 退款
      if (paymentService) {
        let payment = await paymentService.models.Payment.findOne({
          state: 'success',
          orders: order._id
        }).session(this.dbSession);
        if (payment) {
          let refund = new paymentService.models.Refund();
          refund.title = payment.title;
          refund.user = payment.user;
          refund.currency = payment.currency;
          refund.type = payment.type;
          refund.amount = payment.amount;
          refund.state = 'pending';
          await paymentService.sleds.Refund.run({
            payment,
            refund
          }, { dbSession: this.dbSession });
        }
      }
    }
    return records;
  }
}
