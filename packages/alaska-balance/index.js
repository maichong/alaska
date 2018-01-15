'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

/**
 * @class BalanceService
 */
class BalanceService extends _alaska.Service {

  constructor(options) {
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
    currencies.forEach(c => {
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

  get currencies() {
    return this._currencies;
  }

  get currenciesMap() {
    return this._currenciesMap;
  }

  get defaultCurrency() {
    return this._defaultCurrency;
  }

  /**
   * 异步获取货币列表
   * @returns {void|Promise.<Alaska$Currency[]>}
   */
  getCurrenciesAsync() {
    if (!this._currenciesPromise) {
      this._currenciesPromise = new Promise(resolve => {
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
  getDefaultCurrencyAsync() {
    if (!this._defaultCurrencyPromise) {
      this._defaultCurrencyPromise = new Promise(resolve => {
        if (this._defaultCurrency) {
          resolve(this._defaultCurrency);
        } else {
          this._defaultCurrencyPromiseCallback = resolve;
        }
      });
    }
    return this._defaultCurrencyPromise;
  }

  async adminSettings(ctx, user, settings) {
    settings.currencies = this._currenciesMap;
    settings.defaultCurrency = this._defaultCurrency;
  }
}

exports.default = new BalanceService();