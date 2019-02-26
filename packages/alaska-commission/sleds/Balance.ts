import { Sled } from 'alaska-sled';
import balanceService, { CreateIncome } from 'alaska-balance';
import User from 'alaska-user/models/User';
import Commission from '../models/Commission';
import { BalanceParams } from '..';

export default class Balance extends Sled<BalanceParams, Commission> {
  async exec(params: BalanceParams): Promise<Commission> {
    let commission = params.record;

    if (commission.state === 'balanced') {
      return commission;
    }

    try {
      let user = await User.findById(commission.user);

      if (!user) {
        throw new Error('Can not find user!');
      }

      let currency = balanceService.currenciesMap[commission.currency];
      if (!currency) {
        throw new Error('Can not find currency!');
      }

      // @ts-ignore index
      if (!User.fields[commission.currency]) {
        throw new Error(`Can not find field User.${commission.currency}!`);
      }

      await (user._[commission.currency].income as CreateIncome)(commission.amount, commission.title, 'commission', this.dbSession);

      commission.state = 'balanced';
      commission.balancedAt = new Date();
    } catch (error) {
      commission.state = 'failed';
      commission.failure = error.message;
    }
    await commission.save({ session: this.dbSession });
    return commission;
  }
}
