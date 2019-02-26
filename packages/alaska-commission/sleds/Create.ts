import * as _ from 'lodash';
import { Sled } from 'alaska-sled';
import balanceService from 'alaska-balance';
import User from 'alaska-user/models/User';
import service, { CreateParams } from '..';
import Commission from '../models/Commission';

export default class Create extends Sled<CreateParams, Commission[]> {
  async exec(p: CreateParams): Promise<Commission[]> {
    let {
      user, title, currency, order, contributor, amount, price, rate, level, main
    } = p;
    if (!user) throw new Error('user is required for create commission!');

    const commissionRates = service.config.get('commissionRates');
    const currencies = balanceService.currenciesMap;
    const defaultCurrency = balanceService.defaultCurrency;

    level = level || 1;
    currency = currency || (order && order.currency) || '';
    title = title || (order && order.title) || '';
    contributor = contributor || (order && order.user) || null;
    price = price || (order && order.payed) || 0;

    if (!amount && amount !== 0) {
      if (!price) throw new Error('amount or price is required for create commission!');
      if (!rate) {
        rate = commissionRates[level - 1];
      }
      if (!rate) throw new Error('can not determine commission rate!');
      let currencyObject = defaultCurrency;
      if (currency && currencies[currency]) {
        currencyObject = currencies[currency];
      }
      amount = _.round(rate * price, currencyObject.precision);
    }
    let commission = new Commission({
      user,
      title,
      currency,
      amount,
      contributor,
      order,
      level,
      main
    });

    await commission.save({ session: this.dbSession });

    let results = [commission];
    if (commissionRates.length > level && price) {
      // 创建多级佣金
      let u = user as User;
      if (!u.save) {
        //如果不是模型记录
        u = await User.findById(user);
      }
      if (u && u.promoter) {
        //用户有上级
        let list = await Create.run({
          user: u.promoter,
          level: level + 1,
          amount: 0,
          price,
          contributor,
          rate: 0,
          title,
          order,
          currency,
          main: main || commission._id
        }, { dbSession: this.dbSession });
        results.push(...list);
      }
    }
    return results;
  }
}
