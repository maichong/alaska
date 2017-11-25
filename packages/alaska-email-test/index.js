'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

class EmailTestDriver extends _alaska.Driver {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.instanceOfEmailDriver = true, _temp;
  }

  /**
   * 发送
   * @param {Alaska$emailMessage} data https://nodemailer.com/ E-mail message fields
   * @returns Promise<Object>
   */
  send(data) {
    console.log('send email', data);
    return Promise.resolve({});
  }
}
exports.default = EmailTestDriver;
EmailTestDriver.classOfEmailDriver = true;