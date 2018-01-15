// @flow

import { Service } from 'alaska';

/**
 * @class BalanceService
 */
class BalanceService extends Service {
  _currencies: Alaska$Currency[];
  _currenciesMap: Object;
  _defaultCurrency: Alaska$Currency;
  currencies: Alaska$Currency[];
  _currenciesPromise: void | Promise<Alaska$Currency[]>;
  _currenciesPromiseCallback: void | Function;
  _defaultCurrencyPromise: void | Promise<Alaska$Currency>;
  _defaultCurrencyPromiseCallback: void | Function;

  constructor(options?: Alaska$Service$options) {
    options = options || { dir: '', id: '' };
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-balance';
    super(options);
  }

  postLoadConfig() {
    let currencies = this.getConfig('currencies');
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

    // Callbacks
    if (this._currenciesPromiseCallback) {
      this._currenciesPromiseCallback(currencies);
    }
    if (this._defaultCurrencyPromiseCallback) {
      this._defaultCurrencyPromiseCallback(this._defaultCurrency);
    }
  }

  get currencies(): Alaska$Currency[] {
    return this._currencies;
  }

  get currenciesMap(): Object {
    return this._currenciesMap;
  }

  get defaultCurrency(): Alaska$Currency {
    return this._defaultCurrency;
  }

  /**
   * 异步获取货币列表
   * @returns {void|Promise.<Alaska$Currency[]>}
   */
  getCurrenciesAsync(): Promise<Alaska$Currency[]> {
    if (!this._currenciesPromise) {
      this._currenciesPromise = new Promise((resolve) => {
        if (this._currencies) {
          resolve(this._currencies);
        } else {
          this._currenciesPromiseCallback = resolve;
        }
      });
    }
    return this._currenciesPromise;
  }

  /**
   * 异步获取默认货币
   * @returns {void|Promise.<Alaska$Currency>}
   */
  getDefaultCurrencyAsync(): Promise<Alaska$Currency> {
    if (!this._defaultCurrencyPromise) {
      this._defaultCurrencyPromise = new Promise((resolve) => {
        if (this._defaultCurrency) {
          resolve(this._defaultCurrency);
        } else {
          this._defaultCurrencyPromiseCallback = resolve;
        }
      });
    }
    return this._defaultCurrencyPromise;
  }

  async adminSettings(ctx: Alaska$Context, user: User, settings: Object) {
    settings.currencies = this._currenciesMap;
    settings.defaultCurrency = this._defaultCurrency;
  }
}

export default new BalanceService();
