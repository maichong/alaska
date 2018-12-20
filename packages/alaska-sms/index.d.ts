import { Service, Driver, DriverOptions } from 'alaska';
import { SelectOption } from '@samoyed/types';
import Sms from './models/Sms';
import Send from './sleds/Send';

export interface SmsDriverOptions extends DriverOptions {
  label: string; //驱动显示名称
}

export class SmsDriver<T, O extends SmsDriverOptions> extends Driver<O, null> {
  static readonly classOfSmsDriver: true;
  readonly instanceOfSmsDriver: true;

  send(to: string, message: string): Promise<T>;
}

export class SmsService extends Service {
  models: {
    Sms: typeof Sms;
  };
  sleds: {
    Send: typeof Send;
  };
  driversOptions: SelectOption[];
  defaultDriver: void | SmsDriver<any, any>;
  driversMap: {
    [key: string]: SmsDriver<any, any>;
  };

  getDriverOptionsAsync(): Promise<SelectOption[]>
}

declare const SMS: SmsService;

export default SMS;
