'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _alaska = require('alaska');

var _GoodsCat = require('./GoodsCat');

var _GoodsCat2 = _interopRequireDefault(_GoodsCat);

var _GoodsProp = require('./GoodsProp');

var _GoodsProp2 = _interopRequireDefault(_GoodsProp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class GoodsPropValue extends _alaska.Model {

  async preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    // $Flow count
    let count = await GoodsPropValue.count({
      prop: this.prop,
      title: this.title
    }).where('_id').ne(this._id);
    if (count) {
      throw new Error('Reduplicate prop value title');
    }
    if (this.isNew || this.isModified('cats') || this.isModified('common')) {
      await this.updateCatsIndex();
    }
  }

  postSave() {
    this.processProp();
  }

  postRemove() {
    this.processProp();
  }

  /**
   * 整理相应属性的属性值
   */
  async processProp() {
    // $Flow findById
    let prop = await _GoodsProp2.default.findById(this.prop);
    if (!prop) return;
    // $Flow find
    let values = await GoodsPropValue.find({ prop: prop._id });
    // $Flow v._id类型太多 确认正确
    prop.values = values.map(v => v._id);
    await prop.save();
  }

  /**
   * 更新本属性值所对应分类的关联索引
   */
  async updateCatsIndex() {
    if (!this.common && this.cats && this.cats.length) {
      let cats = {};
      for (let cid of this.cats) {
        if (cats[cid]) {
          continue;
        }
        // $Flow findById
        let cat = await _GoodsCat2.default.findById(cid);
        cats[cid] = cat;
        let subs = await cat.allSubs();
        _lodash2.default.defaults(cats, subs);
      }
      this.catsIndex = Object.keys(cats);
    } else {
      this.catsIndex = undefined;
    }
  }
}
exports.default = GoodsPropValue;
GoodsPropValue.label = 'Property Values';
GoodsPropValue.icon = 'square';
GoodsPropValue.defaultColumns = 'title prop common sort createdAt';
GoodsPropValue.defaultSort = '-sort -createdAt';
GoodsPropValue.fields = {
  title: {
    label: 'Title',
    type: String,
    required: true
  },
  prop: {
    label: 'Goods Property',
    ref: _GoodsProp2.default,
    index: true,
    required: true
  },
  cats: {
    label: 'Categories',
    type: 'category',
    ref: 'GoodsCat',
    private: true,
    disabled: 'common'
  },
  catsIndex: {
    label: 'Categories',
    ref: ['GoodsCat'],
    hidden: true
  },
  common: {
    label: 'Common',
    default: true,
    type: Boolean
  },
  sort: {
    label: 'Sort',
    type: Number,
    default: 0
  },
  createdAt: {
    label: 'Created At',
    type: Date,
    private: true
  }
};