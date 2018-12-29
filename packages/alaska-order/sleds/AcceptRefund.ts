import * as _ from 'lodash';
import { Sled } from 'alaska-sled';
import Order from '../models/Order';
import OrderGoods from '../models/OrderGoods';
import orderService, { AcceptRefundParams } from '..';
import { PaymentService } from 'alaska-payment';

/**
 * 接受退款
 * 800 -> 600
 */
export default class AcceptRefund extends Sled<AcceptRefundParams, Order[]> {
  async exec(params: AcceptRefundParams): Promise<Order[]> {
    if (this.result) return this.result; // 在前置插件中已经处理
    if (!params.record && _.isEmpty(params.records)) throw new Error('record or records is required');
    let records = _.size(params.records) ? params.records : [params.record];
    if (_.find(records, (o: Order) => ![800].includes(o.state))) orderService.error('Order state error');

    for (let order of records) {
      let refundAmount = order.refundAmount;
      order.state = 600;
      order.closed = true;
      order.lastRefundAmount = order.refundAmount;
      order.lastRefundQuantity = order.refundQuantity;
      order.refundedAmount = (order.refundedAmount || 0) + order.refundAmount;
      order.refundedQuantity = (order.refundedQuantity || 0) + order.refundQuantity;
      order.refundTimeout = null;
      order.refundAmount = 0; // 重置退款申请总额
      order.refundQuantity = 0; // 重置退货申请总数量

      const paymentService = orderService.main.allServices['alaska-payment'] as PaymentService;
      // payment 退款
      if (refundAmount && paymentService) {
        const { Payment, Refund } = paymentService.models;
        let payment = await Payment.findOne({
          state: 1,
          orders: order._id
        });
        if (payment) {
          let refund = new Refund();
          refund.title = payment.title;
          refund.user = payment.user;
          refund.currency = payment.currency;
          refund.type = payment.type;
          refund.amount = refundAmount;
          refund.state = 0;
          await paymentService.sleds.Refund.run({
            payment,
            refund
          });
        } else {
          console.error('Not payment found for refund, Order:' + order.id);
        }
      }

      // 商品数量并不会自动退回入库，因为在线商城的退款流程中，商家审核通过退货之后，买家才将商品邮寄回去，而此时是不能直接认为商品回到库存中，而是商家收到货后，再进行入库操作
      // 另外，考虑到用户退回的货物可能是问题产品，不能再次进行售卖，所以此时不自动将退货数量计入库存
      // 如果需要，可在具体项目中加入后置钩子，进行自定义处理
      await order.save();
      order.createLog('Order refunded');
      let goods = await OrderGoods.find({ order: order._id });
      await Promise.all(goods.map(async (item: OrderGoods) => {
        item.lastRefundAmount = item.refundAmount;
        item.lastRefundQuantity = item.refundQuantity;
        item.refundAmount = 0;
        item.refundQuantity = 0;
        await item.save();
      }));
    }
    return records;
  }
}
