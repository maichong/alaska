import * as _ from 'lodash';
import { Sled } from 'alaska-sled';
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
    if (_.find(records), (o: Order) => ![300].includes(o.state)) service.error('Order state error');

    for (let order of records) {
      if (!order.failure) {
        order.failure = 'Rejected';
      }
      await order.save();
      order.createLog('Order rejected');
    }
    return records;
  }
}
