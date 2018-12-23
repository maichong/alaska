import { Sled } from 'alaska-sled';
import Order from '../models/Order';
import { RefundRejectParams } from '..';

/**
 * 拒绝退款
 * 800 -> 400/500
 */
export default class RefundReject extends Sled<RefundRejectParams, Order[]> { }
