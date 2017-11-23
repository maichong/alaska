// @flow

import { Driver } from 'alaska';

export default class EmailTestDriver extends Driver {
  static classOfEmailDriver = true;
  instanceOfEmailDriver = true;

  /**
   * 发送
   * @param {Alaska$emailMessage} data https://nodemailer.com/ E-mail message fields
   * @returns Promise<Object>
   */
  send(data: Alaska$emailMessage): Promise<Object> {
    console.log('send email', data);
    return Promise.resolve({});
  }
}
