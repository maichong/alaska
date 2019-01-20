import * as _ from 'lodash';
import * as moment from 'moment';
import { Sled } from 'alaska-sled';
import settingsService from 'alaska-settings';
import balanceService from 'alaska-balance';
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

    let refundReason = params.reason || _.get(params, 'body.refundReason') || '';
    let refundQuantity: number = Number(params.quantity || _.get(params, 'body.refundQuantity') || 0);
    if (Number.isNaN(refundQuantity) || refundQuantity < 0 || refundQuantity !== _.round(refundQuantity)) service.error('invalid quantity');

    let refundAmount: number = Number(params.amount || _.get(params, 'body.refundAmount') || 0) || service.error('refund amount is required');
    let currency = balanceService.currenciesMap[order.currency] || balanceService.defaultCurrency;
    // 检查金额是否有多余小数
    if (Number.isNaN(refundAmount) || refundAmount <= 0 || refundAmount !== _.round(refundAmount, currency.precision)) service.error('invalid amount');

    if (refundAmount + (order.refundAmount || 0) + (order.refundedAmount || 0) > order.payed) service.error('refund amount can not greater than payed amount');

    if (params.orderGoods) {
      let goods = await OrderGoods.findById(params.orderGoods, {
        order: order._id
      }).session(this.dbSession);
      if (!goods) service.error('Order goods not found');
      if (goods.refundAmount) service.error('The goods of the order already applied refund');
      goods.refundReason = refundReason;
      goods.refundAmount = refundAmount;
      goods.refundQuantity = refundQuantity;
      await goods.save({ session: this.dbSession });
    }
    if (!order.refundTimeout) {
      let refundTimeout = await settingsService.get('order.refundTimeout');
      if (refundTimeout) {
        order.refundTimeout = moment().add(refundTimeout, 's').toDate();
      }
    }
    order.refundReason = refundReason;
    order.refundAmount = refundAmount + (order.refundAmount || 0);
    order.refundQuantity = refundQuantity + (order.refundQuantity || 0);
    order.state = 800;
    await order.save({ session: this.dbSession });
    order.createLog('Apply refund', this.dbSession);

    return order;
  }
}
