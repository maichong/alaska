'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nodemailer = require('nodemailer');

var _nodemailer2 = _interopRequireDefault(_nodemailer);

var _alaska = require('alaska');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class EmailSmtpDriver extends _alaska.Driver {

  constructor(service, options) {
    super(service, options);
    this.instanceOfEmailDriver = true;
    this.transporter = null;
  }

  /**
   * 发送
   * @param {Alaska$emailMessage} data https://nodemailer.com/ E-mail message fields
   * @returns Promise<Object>
   */
  send(data) {
    if (!this.transporter) {
      // $Flow
      this.transporter = _nodemailer2.default.createTransport(this.options.smtp, this.options.defaults);
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
exports.default = EmailSmtpDriver;
EmailSmtpDriver.classOfEmailDriver = true;