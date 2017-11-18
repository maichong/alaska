// @flow

import _ from 'lodash';
import { Service } from 'alaska';
import USER from 'alaska-user';

/**
 * @class BalanceService
 */
class BalanceService extends Service {
  _currencies: Alaska$SelectField$option[];
  _currenciesMap: Object;
  _defaultCurrency: Alaska$SelectField$option;
  currencies: Alaska$SelectField$option[];

  constructor(options?: Alaska$Service$options) {
    options = options || { dir: '', id: '' };
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-balance';
    super(options);
  }

  postInit() {
    let service = this;
    USER.pre('registerModel', (Model) => {
      if (Model.name !== 'User') return;
      service._currencies.forEach((c) => {
        Model.underscoreMethod(c.value, 'income', async function (amount: number, title: string, type: ?string) {
          // 只能在这里导入模型，如果在头部import会循环引用
          const Income = service.model('Income');
          let user = this;
          let balance = (user.get(c.value) + amount) || 0;
          if (c.precision !== undefined) {
            balance = _.round(balance, c.precision);
          }
          user.set(c.value, balance);
          let income = new Income({
            type,
            title,
            amount,
            balance,
            target: 'balance',
            currency: c.value,
            user
          });
          await income.save();
          await user.save();
        });
        if (Model.fields[c.value]) return;
        Model.fields[c.value] = {
          label: c.label,
          type: Number,
          default: 0,
          addonAfter: c.unit
        };
      });
    });
  }

  postLoadConfig() {
    let currencies = this.config('currencies');
    if (!currencies || !currencies.length) {
      throw new Error('alaska-balance service require currency settings.');
    }
    this._currencies = currencies;
    this._currenciesMap = {};
    let currenciesMap = this._currenciesMap;
    currencies.forEach((c) => {
      currenciesMap[c.value] = c;
      if (c.default) {
        this._defaultCurrency = c;
      }
    });
    if (!this._defaultCurrency) {
      throw new Error('Default currency not specified.');
    }
  }

  get currencies(): Alaska$SelectField$option[] {
    return this._currencies;
  }

  get currenciesMap(): Object {
    return this._currenciesMap;
  }

  get defaultCurrency(): Alaska$SelectField$option {
    return this._defaultCurrency;
  }

  async adminSettings(ctx: Alaska$Context, user: User, settings: Object) {
    settings.currencies = this._currenciesMap;
    settings.defaultCurrency = this._defaultCurrency;
  }
}

export default new BalanceService();
