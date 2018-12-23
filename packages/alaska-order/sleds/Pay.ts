import * as _ from 'lodash';
import { Sled } from 'alaska-sled';
import Order from '../models/Order';
import service, { PayParams } from '..';

/**
 * 用户支付
 * 200 -> 300
 */
export default class Pay extends Sled<PayParams, Order[]> {
  async exec(params: PayParams): Promise<Order[]> {
    if (this.result) return this.result; // 在前置插件中已经处理
    if (!params.record && _.isEmpty(params.records)) throw new Error('record or records is required');
    let records = _.size(params.records) ? params.records : [params.record];
    if (_.find(records), (o: Order) => ![200].includes(o.state)) service.error('Order state error');

    for (let order of records) {
      order.state = 300;
      order.paymentTimeout = null;
      await order.save();
      order.createLog('Order payed');
    }

    return records;
  }
}
