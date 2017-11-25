// @flow

import moment from 'moment';
import { Sled } from 'alaska';
import SETTINGS from 'alaska-settings';
import service from '../';
import Order from '../models/Order';

/**
 * 下单Sled
 */
export default class Create extends Sled {
  /**
   * @param params 订单数据对象
   *        params.pre    {boolean}
   *        params.user   {User} 用户
   *        params.orders {[Order]} 前置钩子生成的订单
   */
  async exec(params: {
    pre:boolean;
    user:User;
    orders:Order[];
  }): Promise<Object> {
    let orders = params.orders;
    if (!orders || !orders.length) {
      //前置钩子未生成任何订单
      service.error('Can not create any order');
    }
    if (!params.pre) {
      let paymentTimeout = await SETTINGS.get('paymentTimeout');
      for (let order of orders) {
        for (let item of order.items) {
          await item.save();
        }
        if (paymentTimeout && order.state === 200 && !order.paymentTimeout) {
          order.paymentTimeout = moment().add(paymentTimeout, 's').toDate();
        }
        await order.save();
        order.createLog('Order created');
      }
    }
    return params;
  }
}
