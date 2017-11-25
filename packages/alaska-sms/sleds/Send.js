'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _intlMessageformat = require('intl-messageformat');

var _intlMessageformat2 = _interopRequireDefault(_intlMessageformat);

var _alaska = require('alaska');

var _alaska2 = _interopRequireDefault(_alaska);

var _ = require('../');

var _2 = _interopRequireDefault(_);

var _Sms = require('../models/Sms');

var _Sms2 = _interopRequireDefault(_Sms);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const messageCache = {};

class Send extends _alaska.Sled {
  /**
   * 发送短信
   * @param params
   *        params.sms 短信模板ID或记录
   *        params.to 目标手机号
   *        [params.message] 短信内容,如果有此值,则忽略params.sms
   *        [params.locale] 短信采用的语言
   *        [params.driver] 驱动,如果不指定,则采用params.sms记录中指定的驱动或默认驱动
   *        [params.values] 短信内容中填充的数据
   */
  async exec(params) {
    let message = params.message;
    let driver = params.driver;
    let to = params.to;
    if (driver && typeof driver === 'string') {
      driver = _2.default.driversMap[driver];
    }
    if (driver && to && message) {
      return await driver.send(to, message);
    }
    let sms = params.sms;
    if (sms && typeof sms === 'string') {
      // $Flow
      let s = await _Sms2.default.findById(sms);
      sms = s;
    }
    if (!message) {
      if (!sms) _alaska2.default.panic('Can not find sms');
      message = sms.content;
      if (params.locale) {
        //定义了语言
        let field = 'content_' + params.locale.replace('-', '_');
        if (sms[field]) {
          message = sms[field];
        }
      }
    }

    if (!driver) {
      if (sms && sms.driver) {
        driver = _2.default.driversMap[sms.driver];
      }
      if (!driver) {
        driver = _2.default.defaultDriver;
      }
    }

    let values = params.values;
    if (values) {
      if (!messageCache[message]) {
        messageCache[message] = new _intlMessageformat2.default(message, '');
      }
      message = messageCache[message].format(values);
    }

    if (!driver) throw new Error('Can not resolve sms driver!');
    return await driver.send(to, message);
  }
}
exports.default = Send;