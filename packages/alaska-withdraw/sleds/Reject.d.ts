import { Sled } from 'alaska-sled';
import { RejectParams } from '..';
import Withdraw from '../models/Withdraw';

export default class Reject extends Sled<RejectParams, Withdraw> {
}
