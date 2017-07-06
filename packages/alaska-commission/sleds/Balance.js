// @flow

import { Sled } from 'alaska';
import User from 'alaska-user/models/User';
import BALANCE from 'alaska-balance';

export default class Balance extends Sled {
  /**
   * @param params
   *        params.commission
   *        [params.user]
   */
  async exec(params: Object) {
    let user = params.user;
    let commission = params.commission;

    if (commission.state) {
      return commission.toObject();
    }

    try {
      if (!user) {
        // $Flow findById
        user = await User.findById(commission.user);
      }

      if (!user) {
        throw new Error('can not find user');
      }

      let currency = BALANCE.currenciesMap[commission.currency];
      if (!currency) {
        throw new Error('can not find currency');
      }

      if (!User.fields[commission.currency]) {
        throw new Error(`can not find User.${commission.currency} field`);
      }

      await user._[commission.currency].income(commission.amount, commission.title, 'commission');

      commission.state = 1;
      commission.balancedAt = new Date();
    } catch (error) {
      commission.state = -1;
      commission.error = error.message;
    }
    await commission.save();
    return commission.toObject();
  }
}
