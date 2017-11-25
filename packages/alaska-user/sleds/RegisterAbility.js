'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _Ability = require('../models/Ability');

var _Ability2 = _interopRequireDefault(_Ability);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 注册权限
 */
// @Flow

class RegisterAbility extends _alaska.Sled {
  /**
   * @param params
   *        params.id
   *        params.title
   *        params.sort
   *        params.service
   * @returns {Ability}
   */
  async exec(params) {
    let id = params._id || params.id;
    let ability = await _Ability2.default.findById(id);
    if (ability) {
      //权限已经存在
      return ability;
    }
    console.log(`Register ability : ${id}`);
    ability = new _Ability2.default(params);
    ability._id = id;
    await ability.save();
    return ability;
  }
}
exports.default = RegisterAbility;