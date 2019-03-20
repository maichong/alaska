import * as _ from 'lodash';
import { Sled } from 'alaska-sled';
import settingsService from 'alaska-settings';
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
    if (_.find(records, (o: Order) => ![200].includes(o.state))) service.error('Order state error');

    let needConfirm = await settingsService.get('order.needConfirm');

    for (let order of records) {
      let confirm: boolean = order.needConfirm;
      if (typeof confirm === 'undefined') {
        confirm = needConfirm;
      }
      order.state = confirm ? 300 : 400;
      order.paymentTimeout = null;
      order.payedAt = new Date();
      await order.save({ session: this.dbSession });
      order.createLog('Order payed', this.dbSession);
    }

    return records;
  }
}
