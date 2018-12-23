import { Sled } from 'alaska-sled';
import Order from '../models/Order';
import { DeleteParams } from '..';

export default class Delete extends Sled<DeleteParams, Order[]> { }
