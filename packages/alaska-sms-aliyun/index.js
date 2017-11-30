'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _ini = require('ini');

var _ini2 = _interopRequireDefault(_ini);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _akitaNode = require('akita-node');

var _akitaNode2 = _interopRequireDefault(_akitaNode);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const api = _akitaNode2.default.resolve('aliyun-sms-driver');

class SmsAliyunDriver extends _alaska.Driver {

  constructor(service, options) {
    super(service, options);
    this.instanceOfSmsDriver = true;
    if (!options.AccessKeyId) throw new Error('Aliyun sms driver init options missing AccessKeyId');
    if (!options.AccessKeySecret) throw new Error('Aliyun sms driver init options missing AccessKeySecret');
    if (!options.SignName) throw new Error('Aliyun sms driver init options missing SignName');
  }

  /**
   * @param {string} to
   * @param {string} message
   * @returns {Promise<Object>}
   */
  async send(to, message) {
    let config = _ini2.default.parse(message);

    if (!config.TemplateCode) throw new Error('Can not find TemplateCode in sms message content');
    if (!config.params) {
      config.params = {};
    }

    let object = {
      Action: 'SingleSendSms',
      SignName: this.options.SignName,
      TemplateCode: config.TemplateCode,
      RecNum: to,
      ParamString: JSON.stringify(config.params),
      Format: 'JSON',
      Version: '2016-09-27',
      AccessKeyId: this.options.AccessKeyId,
      SignatureMethod: 'HMAC-SHA1',
      Timestamp: (0, _moment2.default)().toISOString(),
      SignatureVersion: '1.0',
      SignatureNonce: Math.random().toString().substr(2)
    };

    let params = Object.keys(object).sort((a, b) => a > b ? 1 : -1).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(object[key])}`).join('&');

    let stringToSign = 'POST&%2F&' + encodeURIComponent(params);

    let hmac = _crypto2.default.createHmac('sha1', this.options.AccessKeySecret + '&');

    hmac.update(stringToSign);

    let sign = hmac.digest('base64');

    return await api.post('https://sms.aliyuncs.com/', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params + '&Signature=' + encodeURIComponent(sign)
    });
  }
}
exports.default = SmsAliyunDriver;
SmsAliyunDriver.classOfSmsDriver = true;