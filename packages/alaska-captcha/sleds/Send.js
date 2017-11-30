'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stringRandom = require('string-random');

var _stringRandom2 = _interopRequireDefault(_stringRandom);

var _alaska = require('alaska');

var _alaska2 = _interopRequireDefault(_alaska);

var _ = require('../');

var _2 = _interopRequireDefault(_);

var _Captcha = require('../models/Captcha');

var _Captcha2 = _interopRequireDefault(_Captcha);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Send extends _alaska.Sled {
  /**
   * 发送验证码
   * @param params
   *        params.to
   *        params.id Captcha ID
   *        [params.ctx]
   *        [params.locale]
   *        [params.code] 验证码
   *        [params.values] 信息模板值
   */
  async exec(params) {
    const locales = _2.default.getConfig('locales');
    const CACHE = _2.default.cache;
    let id = params.id;
    let to = params.to;
    let locale = params.locale;
    let values = params.values || {};
    let code = params.code || values.code;
    if (!locale && params.ctx && locales && locales.length > 1) {
      locale = params.ctx.locale;
    }
    // $Flow findById
    let captcha = await _Captcha2.default.findById(id);
    if (!captcha) {
      throw new Error('unknown captcha');
    }

    if (!code) {
      code = (0, _stringRandom2.default)(captcha.length, {
        numbers: captcha.numbers || false,
        letters: captcha.letters || false
      });
    }

    values.code = code;

    let cacheKey = 'captcha_' + to;
    CACHE.set(cacheKey, code, captcha.lifetime * 1000 || 1800 * 1000);

    if (captcha.type === 'sms' && captcha.sms && _alaska2.default.hasService('alaska-sms')) {
      await _alaska2.default.getService('alaska-sms').run('Send', {
        to,
        sms: captcha.sms,
        locale,
        values
      });
    } else if (captcha.type === 'email' && captcha.email && _alaska2.default.hasService('alaska-email')) {
      await _alaska2.default.getService('alaska-email').run('Send', {
        to,
        email: captcha.email,
        locale,
        values
      });
    } else {
      throw new Error('unsupported captcha type');
    }
  }
}
exports.default = Send;