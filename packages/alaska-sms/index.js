// @flow

import { Service } from 'alaska';
import _ from 'lodash';

class SmsService extends Service {
  constructor(options?: Alaska$Service$options, alaska?: Alaska$Alaska) {
    options = options || {};
    options.id = options.id || 'alaska-sms';
    options.dir = options.dir || __dirname;
    super(options, alaska);
  }

  preLoadModels() {
    let drivers = this.config('drivers');
    if (!drivers || !Object.keys(drivers).length) {
      throw new Error('No sms driver found');
    }
    let driversOptions = [];
    let defaultDriver;
    let driversMap = {};
    _.forEach(drivers, (driver, key) => {
      let label = driver.label || key;
      driversOptions.push({ label, value: key });
      if (driver.send) {
        //已经实例化的driver
      } else if (driver.type) {
        // $Flow  require()需要一个字符串
        let Driver = require(driver.type).default;
        driver = new Driver(this);
      } else {
        throw new Error('invalid sms driver config ' + key);
      }
      driversMap[key] = driver;
      driver.key = key;
      if (!defaultDriver || driver.default) {
        defaultDriver = driver;
      }
    });
    this.driversOptions = driversOptions;
    this.defaultDriver = defaultDriver;
    this.driversMap = driversMap;
  }

  driversOptions: Object[];
  defaultDriver: any;
  driversMap: Object;
}

export default new SmsService();
