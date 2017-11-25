// @flow

import { Service } from 'alaska';
import _ from 'lodash';

class SmsService extends Service {
  driversOptions: Alaska$SelectField$option[];
  defaultDriver: void | Alaska$SmsDriver;
  driversMap: {
    [key: string]: Alaska$SmsDriver
  };
  _optionsPromise: Promise<Alaska$SelectField$option[]>;
  _optionsPromiseCallback: void | Function;

  constructor(options?: Alaska$Service$options) {
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
    _.forEach(drivers, (options, key) => {
      let label = options.label || key;
      driversOptions.push({ label, value: key });
      let driver;
      if (_.isFunction(options.send)) {
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

  getDriverOptionsAsync(): Promise<Alaska$SelectField$option[]> {
    if (!this._optionsPromise) {
      this._optionsPromise = new Promise((resolve) => {
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

export default new SmsService();
