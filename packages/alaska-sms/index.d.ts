import { Service, Driver, DriverOptions } from 'alaska';
import { SelectOption } from '@samoyed/types';
import Sms from './models/Sms';
import Send from './sleds/Send';

export interface SendParams {
  sms: string | Sms; //短信模板ID或记录
  to: string; //目标手机号
  message?: string; //短信内容,如果有此值,则忽略params.sms
  driver?: void | SmsDriver<any, any>; //驱动,如果不指定,则采用params.sms记录中指定的驱动或默认驱动
  locale?: string; //短信采用的语言
  values: { [key: string]: any }; //短信内容中填充的数据
}

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

declare const smsService: SmsService;

export default smsService;
