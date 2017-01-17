// @flow

const nodemailer = require('nodemailer');

exports.default = class EmailSmtpDriver {
  service: Alaska$Service;
  options: Alaska$Service$options;
  transporter: ?Object;

  constructor(service: Alaska$Service, options: Alaska$Service$options) {
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
      this.transporter = nodemailer.createTransport(this.options.smtp, this.options.defaults);
    }
    let transporter:Object = this.transporter||{};
    return new Promise(function (resolve, reject) {
      transporter.sendMail(data, function (error, res) {
        if (error) {
          reject(error);
        } else {
          resolve(res);
        }
      });
    });
  }
};
