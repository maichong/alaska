import { Sled } from 'alaska-sled';
import Order from '../models/Order';
import { TimeoutParams } from '..';

export default class Timeout extends Sled<TimeoutParams, Order[]> {
}
