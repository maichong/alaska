import * as _ from 'lodash';
import { Sled } from 'alaska-sled';
import Order from '../models/Order';
import service, { ConfirmParams } from '..';

/**
 * 商家、管理员审核订单
 * 300 -> 400
 */
export default class Confirm extends Sled<ConfirmParams, Order[]> {
  async exec(params: ConfirmParams): Promise<Order[]> {
    if (this.result) return this.result; // 在前置插件中已经处理
    if (!params.record && _.isEmpty(params.records)) throw new Error('record or records is required');
    let records = _.size(params.records) ? params.records : [params.record];
    if (_.find(records), (o: Order) => o.state !== 300) service.error('Order state error');

    for (let order of records) {
      order.state = 400;
      await order.save();
      order.createLog('Order confirmed');
    }
    return records;
  }
}
