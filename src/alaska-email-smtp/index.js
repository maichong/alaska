// @flow

import Nodemailer from 'nodemailer';
import { Driver } from 'alaska';

export default class EmailSmtpDriver extends Driver {
  static classOfEmailDriver = true;
  instanceOfEmailDriver = true;
  transporter: null | Object;

  constructor(service: Alaska$Service, options: Alaska$Driver$config) {
    super(service, options);
    this.transporter = null;
  }

  /**
   * 发送
   * @param {Alaska$emailMessage} data https://nodemailer.com/ E-mail message fields
   * @returns Promise<Object>
   */
  send(data: Alaska$emailMessage): Promise<Object> {
    if (!this.transporter) {
      // $Flow
      this.transporter = Nodemailer.createTransport(this.options.smtp, this.options.defaults);
    }
    return new Promise((resolve, reject) => {
      // $Flow
      this.transporter.sendMail(data, (error, res) => {
        if (error) {
          reject(error);
        } else {
          resolve(res);
        }
      });
    });
  }

  driver() {
    return this.transporter;
  }

  onDestroy() {
    this.transporter = null;
  }
}
