import { Sled } from 'alaska-sled';
import Order from '../models/Order';
import { PayParams } from '..';

export default class Pay extends Sled<PayParams, Order[]> { }
