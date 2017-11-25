'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _GoodsCat = require('../models/GoodsCat');

var _GoodsCat2 = _interopRequireDefault(_GoodsCat);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 更新分类父子关系
 */
class UpdateCatRef extends _alaska.Sled {
  /**
   * @param params
   * @param {string|ObjectId} params.cat 父分类ID
   */
  async exec(params) {
    // $Flow findById
    let cat = await _GoodsCat2.default.findById(params.cat);
    if (!cat) return;
    // $Flow  find
    let subs = await _GoodsCat2.default.find({ cat: cat._id });
    // $Flow v._id类型太多 确认正确
    cat.subCats = subs.map(sub => sub._id);
    await cat.save();
  }
}
exports.default = UpdateCatRef;