import * as _ from 'lodash';
import { Sled } from 'alaska-sled';
import Order from '../models/Order';
import service, { DeleteParams } from '..';

/**
 * 删除订单，只标记为删除，并不彻底删除
 * 只能删除状态为 600/900 的订单
 */
export default class Delete extends Sled<DeleteParams, Order[]> {
  async exec(params: DeleteParams): Promise<Order[]> {
    if (this.result) return this.result; // 在前置插件中已经处理
    if (!params.record && _.isEmpty(params.records)) throw new Error('record or records is required');
    let records = _.size(params.records) ? params.records : [params.record];
    if (_.find(records, (o: Order) => ![600, 900].includes(o.state))) service.error('Order state error');

    for (let order of records) {
      if (params.admin) {
        order.adminDeleted = true;
        await order.save();
      } else {
        order.userDeleted = true;
        await order.save();
        order.createLog('Deleted');
      }
    }
    return records;
  }
}
