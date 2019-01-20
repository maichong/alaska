import * as _ from 'lodash';
import { Sled } from 'alaska-sled';
import Order from '../models/Order';
import service, { ReceiveParams } from '..';

/**
 * 买家确认收货
 * 500 -> 600
 */
export default class Receive extends Sled<ReceiveParams, Order[]> {
  async exec(params: ReceiveParams): Promise<Order[]> {
    if (this.result) return this.result; // 在前置插件中已经处理
    if (!params.record && _.isEmpty(params.records)) throw new Error('record or records is required');
    let records = _.size(params.records) ? params.records : [params.record];
    if (_.find(records, (o: Order) => ![500].includes(o.state))) service.error('Order state error');

    for (let order of records) {
      order.state = 600;
      order.receiveTimeout = null;
      order.closed = true;
      await order.save({ session: this.dbSession });
      order.createLog('Order received', this.dbSession);
    }

    return records;
  }
}
