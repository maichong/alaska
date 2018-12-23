import * as _ from 'lodash';
import * as moment from 'moment';
import { Sled } from 'alaska-sled';
import settingsService from 'alaska-settings';
import Order from '../models/Order';
import service, { RefundParams } from '..';
import OrderGoods from '../models/OrderGoods';

/**
 * 用户申请退款
 * 400/500/600/800 -> 800
 */
export default class Refund extends Sled<RefundParams, Order> {
  async exec(params: RefundParams): Promise<Order> {
    if (this.result) return this.result; // 在前置插件中已经处理
    let order = params.record;
    if (!order) throw new Error('record is required');
    // 已经完成退款申请
    if (order.state === 800) return order;
    if (![400, 500, 600, 800].includes(order.state)) service.error('Order state error');

    let refundReason = params.reason || _.get(params, 'body.refundReason') || ''
    let refundAmount = params.amount || _.get(params, 'body.refundAmount') || service.error('refund amount is required');
    let refundQuantity = params.quantity || _.get(params, 'body.refundQuantity') || 0;

    if (refundAmount + (order.refundAmount || 0) + (order.refundedAmount || 0) > order.payed) service.error('refund amount can not greater than payed amount');

    if (params.orderGoods) {
      let goods = await OrderGoods.findById(params.orderGoods, {
        order: order._id
      });
      if (!goods) service.error('Order goods not found');
      if (goods.refundAmount) service.error('The goods of the order already applied refund');
      goods.refundReason = refundReason;
      goods.refundAmount = refundAmount;
      goods.refundQuantity = refundQuantity;
      // TODO: 事务回滚
      await goods.save();
    }
    if (!order.refundTimeout) {
      let refundTimeout = await settingsService.get('refundTimeout');
      if (refundTimeout) {
        order.refundTimeout = moment().add(refundTimeout, 's').toDate();
      }
    }
    order.refundReason = refundReason;
    order.refundAmount = refundAmount + (order.refundAmount || 0);
    order.refundQuantity = refundQuantity + (order.refundQuantity || 0);
    await order.save();
    order.createLog('Apply refund');

    return order;
  }
}
