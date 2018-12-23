import * as _ from 'lodash';
import { Sled } from 'alaska-sled';
import Order from '../models/Order';
import service, { RefundRejectParams } from '..';

/**
 * 拒绝退款
 * 800 -> 400/500/600
 */
export default class RefundReject extends Sled<RefundRejectParams, Order[]> {
  async exec(params: RefundRejectParams): Promise<Order[]> {
    if (this.result) return this.result; // 在前置插件中已经处理
    if (!params.record && _.isEmpty(params.records)) throw new Error('record or records is required');
    let records = _.size(params.records) ? params.records : [params.record];
    if (_.find(records), (o: Order) => ![800].includes(o.state)) service.error('Order state error');

    for (let order of records) {
      if (order.closed) {
        order.state = 600;
      } else if (order.shipped) {
        order.state = 500;
      } else {
        order.state = 400;
      }
      order.refundTimeout = null;
      order.refundAmount = 0;
      order.refundQuantity = 0;
      await order.save();
      order.createLog('Refund rejected');
    }
    return records;
  }
}
