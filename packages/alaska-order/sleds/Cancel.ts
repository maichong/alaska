import * as _ from 'lodash';
import { Sled } from 'alaska-sled';
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
    if (_.find(records, (o: Order) => ![200].includes(o.state))) service.error('Order state error');

    for (let order of records) {
      order.state = 900;
      if (!order.failure) {
        order.failure = 'Canceled';
      }
      await order.save();
      order.createLog('Order Canceled');
    }
    return records;
  }
}
