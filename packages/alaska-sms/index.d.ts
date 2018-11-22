import { Service, Driver, DriverOptions } from 'alaska';
import { SelectOption } from '@samoyed/types';
import Sms from './models/Sms';

export interface SmsDriverOptions extends DriverOptions {
  label: string; //驱动显示名称
}

export class SmsDriver<T, O extends SmsDriverOptions> extends Driver<O, null> {
  static readonly classOfSmsDriver: true;
  readonly instanceOfSmsDriver: true;

  send(to: string, message: string): Promise<T>;
}

declare class SmsService extends Service {
  models: {
    Sms: typeof Sms;
  };
  driversOptions: SelectOption[];
  defaultDriver: void | SmsDriver<any, any>;
  driversMap: {
    [key: string]: SmsDriver<any, any>;
  };
  /**
   * 运行一个Sled
   * @param {string} sledName
   * @param {Object} [data]
   * @returns {Promise<*>}
   */
  run(sledName: string, data?: Object): Promise<any>;

  getDriverOptionsAsync(): Promise<SelectOption[]>
}

declare const SMS: SmsService;

export default SMS;
