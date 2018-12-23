import { Sled } from 'alaska-sled';
import Order from '../models/Order';
import { ShipParams } from '..';

/**
 * 发货操作
 */
export default class Ship extends Sled<ShipParams, Order[]> { }
