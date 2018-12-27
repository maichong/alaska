import { Sled } from 'alaska-sled';
import Order from '../models/Order';
import { AcceptRefundParams } from '..';

/**
 * 接受退款
 * 800 -> 600
 */
export default class AcceptRefund extends Sled<AcceptRefundParams, Order[]> {
}
