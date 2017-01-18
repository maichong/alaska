// @flow

import { Sled } from 'alaska';
import Order from '../models/Order';

/**
 * 退款审核拒绝
 */
export default class RefundReject extends Sled {
  /**
   * @param params
   *        params.order  {Order}
   */
  async exec(params: {
    order:Order;
  }) {
    let order = params.order;
    if (order.shipped) {
      order.state = 500;
    } else {
      order.state = 400;
    }
    // $Flow
    order.refundTimeout = null;
    await order.save();
    order.createLog('Refund rejected');
  }
}
