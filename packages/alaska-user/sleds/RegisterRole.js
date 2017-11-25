'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _alaska = require('alaska');

var _2 = require('../');

var _3 = _interopRequireDefault(_2);

var _Role = require('../models/Role');

var _Role2 = _interopRequireDefault(_Role);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 注册角色
 */
class RegisterRole extends _alaska.Sled {
  /**
   * @param {Object} params
   * @param {string} [params._id]
   * @param {string} [params.id]
   * @param {string} params.title
   * @param {number} params.sort
   * @param {string[]} params.abilities
   * @returns {Role}
   */
  async exec(params) {
    let id = params._id || params.id;
    let roles = await _3.default.roles();
    let role = _lodash2.default.find(roles, r => r._id === id);
    if (role) {
      //角色已经存在
      return role;
    }
    console.log(`Register role : ${id}`);
    role = new _Role2.default(params);
    role._id = id;
    await role.save();
    return role;
  }
}
exports.default = RegisterRole;