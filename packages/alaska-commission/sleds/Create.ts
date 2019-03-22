import * as _ from 'lodash';
import { Sled } from 'alaska-sled';
import { CurrencyService } from 'alaska-currency';
import User from 'alaska-user/models/User';
import service, { CreateParams } from '..';
import Commission from '../models/Commission';
import Balance from './Balance';

export default class Create extends Sled<CreateParams, Commission[]> {
  async exec(p: CreateParams): Promise<Commission[]> {
    let {
      user, account, title, order, contributor, amount, price, rate, level, main
    } = p;
    if (!user) throw new Error('user is required for create commission!');
    if (!User._fields.hasOwnProperty(account)) throw new Error(`account "${account}" not found!`);

    let currency = User._fields[account].currency;
    let precision = User._fields[account].precision;
    const commissionRates = service.config.get('commissionRates');
    const currencyService = service.lookup('alaska-currency') as CurrencyService;
    if (currencyService) {
      currency = currency || currencyService.defaultCurrencyId;
      if (!currencyService.currencies.has(currency)) throw new Error(`currency "${currency}" not found!`);
      precision = currencyService.currencies.get(currency).precision;
    }


    level = level || 1;
    title = title || (order && order.title) || '';
    contributor = contributor || (order && order.user) || null;
    price = price || (order && order.payed) || 0;

    if (!amount && amount !== 0) {
      if (!price) throw new Error('amount or price is required for create commission!');
      if (!rate) {
        rate = commissionRates[level - 1];
      }
      if (!rate) throw new Error('can not determine commission rate!');
      amount = rate * price;
      if (typeof precision === 'number') {
        amount = _.round(amount, precision);
      }
    }

    let commission = new Commission({
      user,
      title,
      account,
      currency,
      amount,
      contributor,
      order,
      level,
      main
    });

    await commission.save({ session: this.dbSession });

    if (p.balance) {
      // 立即结算
      await Balance.run({ record: commission }, { dbSession: this.dbSession });
    }

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
          account,
          main: main || commission._id
        }, { dbSession: this.dbSession });
        results.push(...list);
      }
    }
    return results;
  }
}
