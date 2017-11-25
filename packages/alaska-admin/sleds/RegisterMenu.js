'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _AdminMenu = require('../models/AdminMenu');

var _AdminMenu2 = _interopRequireDefault(_AdminMenu);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 注册管理员后台菜单
 */
class RegisterMenu extends _alaska.Sled {
  async exec(params) {
    const id = params.id || params._id;

    let record = await _AdminMenu2.default.findById(id);
    if (record) {
      // $Flow
      return record;
    }

    record = new _AdminMenu2.default(params);
    record._id = id;
    await record.save();

    return record;
  }
}
exports.default = RegisterMenu;