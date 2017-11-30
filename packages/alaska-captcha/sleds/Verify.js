'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _ = require('../');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Verify extends _alaska.Sled {
  /**
   * 验证
   * @param params
   *        params.to
   *        params.code
   */
  async exec(params) {
    if (!params.to || !params.code) return false;
    const CACHE = _2.default.cache;
    let cacheKey = 'captcha_' + params.to;
    let cache = await CACHE.get(cacheKey);
    if (!cache || cache !== params.code) {
      return false;
    }
    CACHE.del(cacheKey);
    return true;
  }
}
exports.default = Verify;