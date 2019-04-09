
import { SmsDriver, SmsDriverConfig } from 'alaska-sms';

export interface SmsTestOptions extends SmsDriverConfig {

}

export default class SmsTestDriver extends SmsDriver<{}, SmsTestOptions, null> {

}
