import * as _ from 'lodash';
import * as moment from 'moment';
import { Sled } from 'alaska-sled';
import settingsService from 'alaska-settings';
import Order from '../models/Order';
import service, { CreateParams } from '..';

/**
 * 下单Sled，需要在前置钩子中完成订单创建，以支持扩展不同类型的订单
 */
export default class Create extends Sled<CreateParams, Order[]> {
  async exec(params: CreateParams): Promise<Order[]> {
    if (this.result) return this.result; // 在前置插件中已经处理
    if (!params.record && _.isEmpty(params.records)) service.error('Can not create any order');
    let records = _.size(params.records) ? params.records : [params.record];
    if (!params.pre) {
      let paymentTimeout = await settingsService.get('paymentTimeout');
      for (let order of records) {
        for (let goods of order.goods) {
          await goods.save();
        }
        if (paymentTimeout && order.state === 200 && !order.paymentTimeout) {
          order.paymentTimeout = moment().add(paymentTimeout, 's').toDate();
        }
        await order.save();
        order.createLog('Order created');
      }
    }
    return records;
  }
}
