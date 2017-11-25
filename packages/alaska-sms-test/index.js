'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

class SmsTestDriver extends _alaska.Driver {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.instanceOfSmsDriver = true, _temp;
  }

  /**
   * @param {string} to
   * @param {string} message
   * @returns {Promise<Object>}
   */
  send(to, message) {
    console.log('send sms to', to, ':', message);
    return Promise.resolve({});
  }
}
exports.default = SmsTestDriver;
SmsTestDriver.classOfSmsDriver = true;