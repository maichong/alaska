// @flow

import { Sled } from 'alaska';
import Order from '../models/Order';

export default class Receive extends Sled {
  /**
   * @param params
   *        params.order  {Order}
   */
  async exec(params: {
    order:Order;
  }) {
    let order = params.order;
    if (order.state === 500) {
      order.state = 600;
    }
    // $Flow
    order.receiveTimeout = null;
    await order.save();
    order.createLog('Order received');
  }
}
