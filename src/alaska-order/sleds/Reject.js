// @flow

import { Sled } from 'alaska';
import Order from '../models/Order';

export default class Reject extends Sled {
  /**
   * @param params
   *        params.order  {Order}
   */
  async exec(params: {
    order:Order;
  }) {
    let order = params.order;
    if (order.state === 300) {
      order.state = 900;
    }
    if (!order.failure) {
      order.failure = 'Rejected';
    }
    await order.save();
    order.createLog('Order rejected');
  }
}
