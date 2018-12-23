import { Sled } from 'alaska-sled';
import Order from '../models/Order';
import { ReceiveParams } from '..';

export default class Receive extends Sled<ReceiveParams, Order[]> {
}
