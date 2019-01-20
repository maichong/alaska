import * as _ from 'lodash';
import * as moment from 'moment';
import { Sled } from 'alaska-sled';
import settingsService from 'alaska-settings';
import Order from '../models/Order';
import service, { ShipParams } from '..';

/**
 * 商家发货
 * 300 / 400 -> 500
 */
export default class Ship extends Sled<ShipParams, Order[]> {
  async exec(params: ShipParams): Promise<Order[]> {
    if (this.result) return this.result; // 在前置插件中已经处理
    if (!params.record && _.isEmpty(params.records)) throw new Error('record or records is required');
    let records = _.size(params.records) ? params.records : [params.record];
    if (_.find(records, (o: Order) => ![300, 400].includes(o.state))) service.error('Order state error');

    for (let order of records) {
      order.state = 500;
      if (!order.receiveTimeout) {
        let receiveTimeout = await settingsService.get('order.receiveTimeout');
        if (receiveTimeout) {
          order.receiveTimeout = moment().add(receiveTimeout, 's').toDate();
        }
      }
      order.shipped = true;
      await order.save({ session: this.dbSession });
      order.createLog('Order shipped', this.dbSession);
    }

    return records;
  }
}
