// @flow

import { Sled } from 'alaska';
import Order from '../models/Order';

/**
 * 同意退款请求
 */
export default class RefundAccept extends Sled {
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
    let currency = order.currency;
    let payed = order.payed;
    //TODO 退款
    await order.save();
    order.createLog('Order refunded');
  }
}
