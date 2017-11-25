// @flow

import moment from 'moment';
import { Sled } from 'alaska';
import SETTINGS from 'alaska-settings';
import service from '../';
import Order from '../models/Order';

/**
 * 用户申请退款
 */
export default class Refund extends Sled {
  /**
   * @param params
   *        params.order  {Order}
   *        params.reason string
   *        params.amount number
   */
  async exec(params: {
    order:Order;
    reason:string;
    amount:number;
  }) {
    let order = params.order;
    if ([400, 500, 800].indexOf(order.state) < 0) service.error('Order state error');
    order.state = 800;

    if (!order.refundTimeout) {
      let refundTimeout = await SETTINGS.get('refundTimeout');
      order.refundTimeout = moment().add(refundTimeout, 's').toDate();
    }
    order.refundReason = params.reason;
    order.refundAmount = params.amount;
    await order.save();
    order.createLog('Apply refund');
  }
}
