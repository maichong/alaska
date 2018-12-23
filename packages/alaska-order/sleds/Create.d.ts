import { Sled } from 'alaska-sled';
import Order from '../models/Order';
import { CreateParams } from '..';

export default class Create extends Sled<CreateParams, Order[]> { }
