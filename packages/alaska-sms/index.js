'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class SmsService extends _alaska.Service {

  constructor(options) {
    options = options || { dir: '', id: '' };
    options.id = options.id || 'alaska-sms';
    options.dir = options.dir || __dirname;
    super(options);
  }

  preLoadModels() {
    let drivers = this.getConfig('drivers');
    if (!drivers || !Object.keys(drivers).length) {
      throw new Error('No sms driver found');
    }
    let driversOptions = [];
    let defaultDriver;
    let driversMap = {};
    _lodash2.default.forEach(drivers, (options, key) => {
      let label = options.label || key;
      driversOptions.push({ label, value: key });
      let driver;
      if (_lodash2.default.isFunction(options.send)) {
        //已经实例化的driver
        driver = options;
      } else {
        driver = this.createDriver(options);
      }
      driversMap[key] = driver;
      if (!defaultDriver || driver.default) {
        defaultDriver = driver;
      }
    });
    this.driversOptions = driversOptions;
    this.defaultDriver = defaultDriver;
    this.driversMap = driversMap;
    if (this._optionsPromiseCallback) {
      this._optionsPromiseCallback(driversOptions);
    }
  }

  getDriverOptionsAsync() {
    if (!this._optionsPromise) {
      this._optionsPromise = new Promise(resolve => {
        if (this.driversOptions) {
          resolve(this.driversOptions);
        } else {
          this._optionsPromiseCallback = resolve;
        }
      });
    }
    return this._optionsPromise;
  }
}

exports.default = new SmsService();