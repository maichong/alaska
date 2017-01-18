// @flow

import { Sled } from 'alaska';
import Order from '../models/Order';

/**
 * 退款申请超时,退款应当自动通过
 */
export default class RefundTimeout extends Sled {
  /**
   * @param params
   *        params.order  {Order}
   */
  async exec(params: {
    order:Order;
  }) {
    let order = params.order;
    order.state = 900;
    // $Flow
    order.refundTimeout = null;
    await order.save();
    order.createLog('Order refunded');
  }
}
