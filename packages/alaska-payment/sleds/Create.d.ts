import { Sled } from 'alaska-sled';
import Payment from '../models/Payment';
import { CreateParams } from '..';

export default class Create extends Sled<CreateParams, Payment> { }
