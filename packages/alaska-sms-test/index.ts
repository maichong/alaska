import SmsDriver from 'alaska-sms/driver';
import { SmsTestOptions } from '.';

export default class SmsTestDriver extends SmsDriver<Object, SmsTestOptions> {

  /**
   * @param {string} to
   * @param {string} message
   * @returns {Promise<Object>}
   */
  send(to: string, message: string): Promise<Object> {
    console.log('send sms to', to, ':', message);
    return Promise.resolve({});
  }
}
