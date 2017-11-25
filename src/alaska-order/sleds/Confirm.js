// @flow

import { Sled } from 'alaska';
import Order from '../models/Order';

/**
 * 审核订单
 */
export default class Confirm extends Sled {
  /**
   * @param params
   *        params.order  {Order}
   */
  async exec(params: {
    order:Order;
  }) {
    let order = params.order;
    if (order.state === 300) {
      order.state = 400;
    }
    await order.save();
    order.createLog('Order confirmed');
  }
}
