// @flow

import Nodemailer from 'nodemailer';

export default class EmailSmtpDriver {
  service: Alaska$Service;
  options: Object;
  transporter: ?Object;

  constructor(service: Alaska$Service, options: Object) {
    this.service = service;
    this.options = options;
    this.transporter = null;
  }

  /**
   * [async] 发送
   * @param data nodemailer e-mail message fields
   */
  send(data: Object) {
    if (!this.transporter) {
      // $Flow
      this.transporter = Nodemailer.createTransport(this.options.smtp, this.options.defaults);
    }
    let transporter: Object = this.transporter || {};
    return new Promise((resolve, reject) => {
      transporter.sendMail(data, (error, res) => {
        if (error) {
          reject(error);
        } else {
          resolve(res);
        }
      });
    });
  }
};
