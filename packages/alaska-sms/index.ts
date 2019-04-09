import * as _ from 'lodash';
import { Service } from 'alaska';
import { SelectOption } from '@samoyed/types';
import { SmsDriver } from '.';

class SmsService extends Service {
  driversOptions: SelectOption[] = [];
  defaultDriver: void | SmsDriver;
  driversMap: Map<string, SmsDriver> = new Map();
  _optionsPromise: Promise<SelectOption[]>;
  _optionsPromiseCallback: void | Function;

  preInit() {
    let drivers = this.config.get('drivers');
    if (!drivers || !Object.keys(drivers).length) {
      throw new Error('No sms driver found');
    }
    let driversOptions = this.driversOptions;
    let defaultDriver: SmsDriver;
    let driversMap = this.driversMap;
    _.forEach(drivers, (options, key: string) => {
      let label: string = options.label || key;
      driversOptions.push({ label, value: key });
      let driver: SmsDriver;
      if (_.isFunction(options.send)) {
        //已经实例化的driver
        driver = options;
      } else {
        driver = this.createDriver(options) as SmsDriver;
      }
      driversMap.set(key, driver);
      if (!defaultDriver || options.default) {
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

  getDriverConfigAsync(): Promise<SelectOption[]> {
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
