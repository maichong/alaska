'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _alaska2 = _interopRequireDefault(_alaska);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 注销
 */
class Logout extends _alaska.Sled {
  /**
   * @param {Object} params
   *                 params.ctx
   */
  async exec(params) {
    let autoLogin = _alaska2.default.main.getConfig('autoLogin');
    if (autoLogin && autoLogin.key) {
      params.ctx.cookies.set(autoLogin.key, '', autoLogin);
    }
    delete params.ctx.session.userId;
  }
}
exports.default = Logout;