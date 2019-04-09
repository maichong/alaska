
import * as _ from 'lodash';
import { Service } from 'alaska';
import { SelectOption } from '@samoyed/types';
import EmailDriver from './driver';
import Email from './models/Email';
import { EamilDriverOptions } from '.';

export { EmailDriver };

class EmailService extends Service {
  drivers: Map<string, EmailDriver> = new Map();

  preInit() {
    let drivers = this.config.get('drivers');
    if (_.isEmpty(drivers)) {
      throw new Error('Missing config [alaska-email/drivers]');
    }
    let driversOptions: SelectOption[] = [];
    _.forEach(drivers, (config: EamilDriverOptions, key: string) => {
      let label: string = config.label || key;
      driversOptions.push({ label, value: key });
      let driver = this.createDriver(config) as EmailDriver;
      this.drivers.set(key, driver);
    });

    Email.fields.driver.options = driversOptions;
  }
}

export default new EmailService({
  id: 'alaska-email'
});
