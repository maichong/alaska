'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _alaska2 = _interopRequireDefault(_alaska);

var _ = require('../');

var _2 = _interopRequireDefault(_);

var _User = require('../models/User');

var _User2 = _interopRequireDefault(_User);

var _encryption = require('../utils/encryption');

var _encryption2 = _interopRequireDefault(_encryption);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let encryption;

/**
 * 登录
 */
class Login extends _alaska.Sled {
  /**
   * 登录失败将抛出异常
   * @param {Object}   params
   * @param {Context}  params.ctx
   * @param {User}     [params.user]
   * @param {string}   params.username
   * @param {string}   params.password
   * @param {boolean}  [params.remember]
   * @returns {User}
   */
  async exec(params) {
    let user = params.user;

    if (!user) {
      // $Flow
      let u = await _User2.default.findOne({
        username: new RegExp('^' + _alaska.utils.escapeRegExp(params.username) + '$', 'i')
      });
      if (!u) {
        _2.default.error('Incorrect username or password', 1101);
      }
      user = u;
    }

    //params中指定了user 并且密码为空
    //免密码登录
    if (!params.user || params.password) {
      let success = await user.auth(params.password);
      if (!success) {
        _2.default.error('Incorrect username or password', 1101);
      }
    }

    params.ctx.session.userId = user.id;

    if (params.remember !== false) {
      const autoLogin = _alaska2.default.main.getConfig('autoLogin');
      if (autoLogin && autoLogin.key && autoLogin.secret) {
        if (!encryption) {
          encryption = new _encryption2.default(autoLogin.secret);
        }
        let cookie = user.id + ':' + encryption.hash(user.password) + ':' + Date.now().toString(36);
        cookie = encryption.encrypt(cookie).toString('base64');
        params.ctx.cookies.set(autoLogin.key, cookie, autoLogin);
      }
    }

    return user;
  }
}
exports.default = Login;