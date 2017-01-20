// @flow

import _ from 'lodash';
import { Sled } from 'alaska';
import BALANCE from 'alaska-balance';
import User from 'alaska-user/models/User';
import service from '../';
import Commission from '../models/Commission';

export default class Create extends Sled {
  /**
   * amount 或 price/rate 必选,如果未指定rate,则必须指定level并设置全局commissionRates
   * @param {Object} params
   *                 params.title     标题
   *                 params.user      用户
   *                 [params.contributor] 贡献者
   *                 [params.order]   关联订单
   *                 [params.main]    主佣金
   *                 [params.currency]佣金货币
   *                 [params.amount]  佣金数量
   *                 [params.price]   价格
   *                 [params.rate]    比例
   *                 [params.level]   等级
   *                 ...
   * @returns {Commission}
   */
  async exec(params:Object) {
    if (!params.user) throw new Error('user required when create commission');

    const commissionRates = service.config('commissionRates');
    const currencies = BALANCE.currenciesMap;
    const defaultCurrency = BALANCE.defaultCurrency;

    params.level = params.level || 1;
    if (!params.currency && params.order && params.order.currency) {
      params.currency = params.order.currency;
    }
    if (!params.title && params.order && params.order.title) {
      params.title = params.order.title;
    }
    if (!params.contributor && params.order && params.order.user) {
      params.contributor = params.order.user;
    }
    if (!params.amount && params.amount !== 0) {
      if (!params.price) throw new Error('amount or price is required when create commission');
      let rate = params.rate;
      if (!rate) {
        rate = commissionRates[params.level - 1];
      }
      if (!rate) throw new Error('can not determine commission rate');
      let currency = defaultCurrency;
      if (params.currency && currencies[params.currency]) {
        currency = currencies[params.currency];
      }
      params.amount = _.round(rate * params.price, currency.precision);
    }
    let commission = new Commission(params);

    await commission.save();

    if (commissionRates.length > params.level && params.price) {
      //创建多级佣金
      let user:User;
      let u = params.user;
      if (!u.save) {
        //如果不是模型记录
        // $Flow findById
        user = await User.findById(u);
      }
      if (user && user.promoter) {
        //用户有上级
        Create.run(Object.assign({}, params, {
          user: user.promoter,
          level: params.level + 1,
          amount: null,
          rate: null,
          main: params.main || commission._id
        }));
      }
    }
    return commission;
  }
}
