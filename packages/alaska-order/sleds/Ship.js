// @flow

import moment from 'moment';
import { Sled } from 'alaska';
import SETTINGS from 'alaska-settings';
import Order from '../models/Order';

/**
 * 发货操作
 */
export default class Ship extends Sled {
  /**
   * @param params
   *        params.order  {Order}
   */
  async exec(params: {
    order:Order;
  }) {
    let order = params.order;
    if (order.state === 400) {
      order.state = 500;
    }
    if (order.state === 500 && !order.receiveTimeout) {
      let receiveTimeout = await SETTINGS.get('receiveTimeout');
      order.receiveTimeout = moment().add(receiveTimeout, 's').toDate();
    }
    order.shipped = true;
    await order.save();
    order.createLog('Order shipped');
  }
}
