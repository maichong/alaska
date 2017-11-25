'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _GoodsCat = require('../models/GoodsCat');

var _GoodsCat2 = _interopRequireDefault(_GoodsCat);

var _GoodsProp = require('../models/GoodsProp');

var _GoodsProp2 = _interopRequireDefault(_GoodsProp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 更新分类属性关联关系
 */
class UpdatePropRef extends _alaska.Sled {
  /**
   * @param {string|ObjectId} params.cat 分类ID
   * @param params
   * @returns {Promise.<void>}
   */
  async exec(params) {
    let cid = params.cat;
    let cats = [];
    while (cid) {
      cats.push(cid);
      // $Flow
      let cat = await _GoodsCat2.default.findById(cid);
      if (cat) {
        cid = cat.parent;
      } else {
        cid = '';
      }
    }
    // $Flow
    let props = await _GoodsProp2.default.find().where('catsIndex').in(cats);
    for (let prop of props) {
      await prop.updateCatsIndex();
      prop.save();
    }
  }
}
exports.default = UpdatePropRef;