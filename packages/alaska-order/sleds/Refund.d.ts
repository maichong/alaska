import { Sled } from 'alaska-sled';
import Order from '../models/Order';
import { RefundParams } from '..';

/**
 * 用户申请退款
 * 400/500/800 -> 800
 */
export default class Refund extends Sled<RefundParams, Order> { }
