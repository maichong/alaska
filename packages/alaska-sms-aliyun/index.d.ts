import { Driver, DriverOptions } from 'alaska';
import { SmsDriver, SmsDriverOptions } from 'alaska-sms';

export interface SmsAliyunOptions extends SmsDriverOptions {
  AccessKeyId: string;
  AccessKeySecret: string;
  SignName: string;
}

export default class SmsAliyunDriver<T> extends SmsDriver<T, SmsAliyunOptions, null> {
  options: SmsAliyunOptions
}
