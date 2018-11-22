import { Sled } from 'alaska-sled';
import { WithdrawRejectParams } from '..';
import Withdraw from '../models/Withdraw';

export default class WithdrawAccept extends Sled<WithdrawRejectParams, Withdraw> {
}
