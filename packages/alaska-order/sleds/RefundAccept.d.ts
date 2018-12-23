import { Sled } from 'alaska-sled';
import Order from '../models/Order';
import { RefundAcceptParams } from '..';

/**
 * 接受退款
 * 800 -> 600
 */
export default class RefundAccept extends Sled<RefundAcceptParams, Order[]> {
}
