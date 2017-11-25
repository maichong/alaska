'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _alaskaSettings = require('alaska-settings');

var _alaskaSettings2 = _interopRequireDefault(_alaskaSettings);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _2 = require('../');

var _3 = _interopRequireDefault(_2);

var _User = require('../models/User');

var _User2 = _interopRequireDefault(_User);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 用户注册
 */
class Register extends _alaska.Sled {
  /**
   * @param {Object}  params
   * @param {Context} [params.ctx]
   * @param {User}    [params.user]
   * @param {string}  [params.username]
   * @param {string}  [params.password]
   *                 ...
   * @returns {User}
   */
  async exec(params) {
    let closeRegister = await _alaskaSettings2.default.get('user.closeRegister');
    if (closeRegister) {
      let closeRegisterReason = await _alaskaSettings2.default.get('user.closeRegisterReason');
      _3.default.error(closeRegisterReason || 'Register closed');
    }
    let user = params.user;
    if (!user) {
      let count = await _User2.default.count({
        username: new RegExp('^' + _alaska.utils.escapeRegExp(params.username) + '$', 'i')
      });
      if (count) {
        _3.default.error('Username is exists');
      }
      if (params.email) {
        let emailCount = await _User2.default.count({
          email: new RegExp('^' + _alaska.utils.escapeRegExp(params.email) + '$', 'i')
        });
        if (emailCount) {
          _3.default.error('Email is exists');
        }
      }
      user = new _User2.default(_lodash2.default.omit(params, 'ctx', 'user'));
    }
    await user.save();

    if (params.ctx) {
      params.ctx.session.userId = user.id;
    }
    return user;
  }
}
exports.default = Register;