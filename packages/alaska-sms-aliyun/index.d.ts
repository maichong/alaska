import { Driver, DriverConfig } from 'alaska';
import { SmsDriver, SmsDriverConfig } from 'alaska-sms';

export interface SmsAliyunOptions extends SmsDriverConfig {
  AccessKeyId: string;
  AccessKeySecret: string;
  SignName: string;
}

export default class SmsAliyunDriver<T> extends SmsDriver<T, SmsAliyunOptions, null> {
  options: SmsAliyunOptions
}
