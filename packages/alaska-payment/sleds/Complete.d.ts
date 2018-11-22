import { Sled } from 'alaska-sled';
import Payment from '../models/Payment';
import { CompleteParams } from '..';

export default class Complete extends Sled<CompleteParams, Payment> { }
