import * as _ from 'lodash';
import { Sled } from 'alaska-sled';
import Order from '../models/Order';
import service, { RefundAcceptParams } from '..';

/**
 * 接受退款
 * 800 -> 600
 */
export default class RefundAccept extends Sled<RefundAcceptParams, Order[]> {
  async exec(params: RefundAcceptParams): Promise<Order[]> {
    if (this.result) return this.result; // 在前置插件中已经处理
    if (!params.record && _.isEmpty(params.records)) throw new Error('record or records is required');
    let records = _.size(params.records) ? params.records : [params.record];
    if (_.find(records), (o: Order) => ![800].includes(o.state)) service.error('Order state error');

    for (let order of records) {
      order.state = 600;
      order.closed = true;
      order.refundedAmount = (order.refundedAmount || 0) + order.refundAmount;
      order.refundedQuantity = (order.refundedQuantity || 0) + order.refundQuantity;
      order.refundTimeout = null;
      order.refundAmount = 0; // 重置退款申请总额
      order.refundQuantity = 0; // 重置退货申请总数量
      // TODO: payment 退款
      await order.save();
      order.createLog('Order refunded');
    }
    return records;
  }
}
