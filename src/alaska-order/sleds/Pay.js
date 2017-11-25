// @flow

import { Sled } from 'alaska';
import Order from '../models/Order';

/**
 * 支付订单
 */
export default class Pay extends Sled {
  /**
   * @param params
   *        params.order  {Order}
   */
  async exec(params: {
    order:Order;
  }) {
    let order = params.order;
    if (order.state === 200) {
      order.state = 300;
    }
    // $Flow
    order.paymentTimeout = null;
    await order.save();
    order.createLog('Order payed');
  }
}
