import { Sled } from 'alaska-sled';
import Order from '../models/Order';
import { RejectRefundParams } from '..';

/**
 * 拒绝退款
 * 800 -> 400/500
 */
export default class RejectRefund extends Sled<RejectRefundParams, Order[]> { }
