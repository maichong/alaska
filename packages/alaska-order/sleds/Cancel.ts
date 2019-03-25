import * as _ from 'lodash';
import { Sled } from 'alaska-sled';
import { IncomeService } from 'alaska-income';
import { PaymentService } from 'alaska-payment';
import User from 'alaska-user/models/User';
import Order from '../models/Order';
import service, { CancelParams } from '..';

/**
 * 买家取消未付款的订单
 * 状态 200 -> 900
 */
export default class Cancel extends Sled<CancelParams, Order[]> {
  async exec(params: CancelParams): Promise<Order[]> {
    if (this.result) return this.result; // 在前置插件中已经处理
    if (!params.record && _.isEmpty(params.records)) throw new Error('record or records is required');
    let records = _.size(params.records) ? params.records : [params.record];
    if (_.find(records, (o: Order) => ![200, 300, 400].includes(o.state))) service.error('Order state error');

    const incomeService = service.lookup('alaska-income') as IncomeService;
    const paymentService = service.lookup('alaska-payment') as PaymentService;

    for (let order of records) {
      let needRefund = order.state > 200;
      order.state = 900;
      if (!order.failure) {
        order.failure = 'Canceled';
      }
      await order.save({ session: this.dbSession });
      order.createLog('Order canceled', this.dbSession);

      // 退还抵扣的积分
      if (incomeService && order.deductionAmount && order.deductionAccount) {
        let user = await User.findById(order.user).session(this.dbSession);
        // 返还、收入
        await incomeService.sleds.Create.run({
          user,
          title: 'Order canceled',
          type: 'refund',
          amount: order.deductionAmount,
          account: order.deductionAccount
        }, { dbSession: this.dbSession });
      }

      if (needRefund && paymentService) {
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
