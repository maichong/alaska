'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _PostCat = require('../models/PostCat');

var _PostCat2 = _interopRequireDefault(_PostCat);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 更新分类父子关系
 */
class UpdateCatRef extends _alaska.Sled {
  /**
   * @param {string|ObjectId} params.cat 父分类ID
   */
  async exec(params) {
    // $Flow  findById
    let cat = await _PostCat2.default.findById(params.cat);
    if (!cat) return;
    // $Flow  find
    let subs = await _PostCat2.default.find({
      parent: cat._id
    });
    // $Flow  c._id和PostCat不兼容
    cat.subCats = subs.map(c => c._id);
    await cat.save();
  }
}
exports.default = UpdateCatRef;