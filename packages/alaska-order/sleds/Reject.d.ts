import { Sled } from 'alaska-sled';
import Order from '../models/Order';
import { RejectParams } from '..';

export default class Reject extends Sled<RejectParams, Order[]> { }
