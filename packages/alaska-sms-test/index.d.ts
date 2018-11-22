
import { SmsDriver, SmsDriverOptions } from 'alaska-sms';

export interface SmsTestOptions extends SmsDriverOptions {

}

export default class SmsTestDriver extends SmsDriver<Object, SmsTestOptions> {

}
