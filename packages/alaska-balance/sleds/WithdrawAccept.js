// @flow

import { Sled } from 'alaska';
import Withdraw from '../models/Withdraw';

export default class WithdrawAccept extends Sled {
  async exec(data: {
    ctx?:Alaska$Context;
    withdraw:Withdraw;
  }): Promise<Object> {
    let withdraw: Withdraw = data.withdraw;
    if (withdraw.state === 0) {
      withdraw.state = 1;
      await withdraw.save();
    }
    return withdraw.toObject();
  }
}
