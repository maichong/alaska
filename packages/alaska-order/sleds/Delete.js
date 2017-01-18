// @flow

import { Sled } from 'alaska';
import Order from '../models/Order';

export default class Delete extends Sled {
  /**
   * @param params
   *        params.order  {Order}
   *        [params.ctx]
   *        [params.admin]
   */
  async exec(params: {
    order:Order;
    ctx:Alaska$Context;
    admin:boolean;
  }) {
    let order = params.order;
    if (params.admin) {
      order.adminDeleted = true;
      await order.save();
    } else {
      order.userDeleted = true;
      await order.save();
      order.createLog('Deleted');
    }
  }
}
