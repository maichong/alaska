'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _alaska = require('alaska');

var _alaskaUser = require('alaska-user');

var _alaskaUser2 = _interopRequireDefault(_alaskaUser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

  postInit() {
    let service = this;
    _alaskaUser2.default.pre('registerModel', Model => {
      if (Model.modelName !== 'User') return;
      service._currencies.forEach(c => {
        Model.underscoreMethod(c.value, 'income', async function (amount, title, type) {
          // 只能在这里导入模型，如果在头部import会循环引用
          const Income = service.getModel('Income');
          let user = this;
          let balance = user.get(c.value) + amount || 0;
          if (c.precision !== undefined) {
            balance = _lodash2.default.round(balance, c.precision);
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
   * @returns {void|Promise.<Alaska$SelectField$option[]>}
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
   * @returns {void|Promise.<Alaska$SelectField$option>}
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