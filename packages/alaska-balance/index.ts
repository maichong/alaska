import { ObjectMap, Service, ServiceOptions } from 'alaska';
import { Currency } from './';

/**
 * @class BalanceService
 */
class BalanceService extends Service {
  _currencies: Currency[];
  _currenciesMap: ObjectMap<Currency>;
  _defaultCurrency: Currency;
  _currenciesPromise: void | Promise<Currency[]>;
  _currenciesPromiseCallback: void | Function;
  _defaultCurrencyPromise: void | Promise<Currency>;
  _defaultCurrencyPromiseCallback: void | Function;

  constructor(options?: ServiceOptions) {
    options = options || { id: '' };
    options.id = options.id || 'alaska-balance';
    super(options);

    this.resolveConfig().then((config) => {
      let currencies = config.get('currencies');
      if (!currencies || !currencies.length) {
        throw new Error('alaska-balance service require currency settings.');
      }
      this._currencies = currencies;
      this._currenciesMap = {};
      let currenciesMap = this._currenciesMap;
      currencies.forEach((c: Currency) => {
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
    });
  }

  get currencies(): Currency[] {
    return this._currencies || this.panic('Can not access currencies before load config!');
  }

  get currenciesMap(): ObjectMap<Currency> {
    return this._currenciesMap || this.panic('Can not access currenciesMap before load config!');
  }

  get defaultCurrency(): Currency {
    return this._defaultCurrency || this.panic('Can not access defaultCurrency before load config!');
  }

  /**
   * 异步获取货币列表
   * @returns {Promise<Currency[]>}
   */
  getCurrenciesAsync(): Promise<Currency[]> {
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
   * @returns {Promise<Currency>}
   */
  getDefaultCurrencyAsync(): Promise<Currency> {
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
}

export default new BalanceService({
  id: 'alaska-balance'
});
