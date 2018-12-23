import { Sled } from 'alaska-sled';
import Order from '../models/Order';
import { CancelParams } from '..';

export default class Cancel extends Sled<CancelParams, Order[]> { }
