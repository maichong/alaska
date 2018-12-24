import * as _ from 'lodash';
import { Sled } from 'alaska-sled';
import Order from '../models/Order';
import service, { TimeoutParams } from '..';

/**
 * 订单超时，买家未在规定时间内付款
 * 状态 200 -> 900
 */
export default class Timeout extends Sled<TimeoutParams, Order[]> {
  async exec(params: TimeoutParams): Promise<Order[]> {
    if (this.result) return this.result; // 在前置插件中已经处理
    if (!params.record && _.isEmpty(params.records)) throw new Error('record or records is required');
    let records = _.size(params.records) ? params.records : [params.record];
    if (_.find(records, (o: Order) => ![200].includes(o.state))) service.error('Order state error');

    for (let order of records) {
      order.state = 900;
      if (!order.failure) {
        order.failure = 'Timeout';
      }
      await order.save();
      order.createLog('Order Timeout');
    }
    return records;
  }
}
