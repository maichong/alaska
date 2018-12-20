import * as _ from 'lodash';
import { Service } from 'alaska';
import { SelectOption } from '@samoyed/types';
import { SmsDriver } from '.';

class SmsService extends Service {
  driversOptions: SelectOption[];
  defaultDriver: void | SmsDriver<any, any>;
  driversMap: {
    [key: string]: SmsDriver<any, any>;
  };
  _optionsPromise: Promise<SelectOption[]>;
  _optionsPromiseCallback: void | Function;

  preInit() {
    let drivers = this.config.get('drivers');
    if (!drivers || !Object.keys(drivers).length) {
      throw new Error('No sms driver found');
    }
    let driversOptions: { label: string; value: number }[] = [];
    let defaultDriver: SmsDriver<any, any>;
    let driversMap: { [key: number]: SmsDriver<any, any> } = {};
    _.forEach(drivers, (options, key: number) => {
      let label: string = options.label || key;
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

  getDriverOptionsAsync(): Promise<SelectOption[]> {
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

export default new SmsService({
  id: 'alaska-sms'
});
