// @flow

import { Sled } from 'alaska';
import Order from '../models/Order';

/**
 * 买家取消订单
 */
export default class Cancel extends Sled {
  /**
   * @param params
   *        params.order  {Order}
   */
  async exec(params: {
    order:Order
  }) {
    let order = params.order;
    order.state = 900;
    order.failure = 'Canceled';
    await order.save();
    order.createLog('Canceled');
  }
}
