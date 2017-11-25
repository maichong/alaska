// @flow

import { Driver } from 'alaska';

export default class SmsTestDriver extends Driver {
  static classOfSmsDriver = true;
  instanceOfSmsDriver = true;

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
