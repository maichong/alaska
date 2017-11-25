'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _alaska = require('alaska');

var _2 = require('../');

var _3 = _interopRequireDefault(_2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class GoodsCat extends _alaska.Model {

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }

  postSave() {
    _3.default.clearCache();
    if (this.parent) {
      _3.default.run('UpdateCatRef', { cat: this.parent });
    }
    _3.default.run('UpdatePropRef', { cat: this.id });
  }

  postRemove() {
    _3.default.clearCache();
    if (this.parent) {
      _3.default.run('UpdateCatRef', { cat: this.parent });
    }
    _3.default.run('UpdatePropRef', { cat: this.id });
  }

  /**
   * 获取当前分类的子分类对象列表
   * @returns {[GoodsCat]}
   */
  async subs() {
    if (this.populated('subCats')) {
      return this.subCats;
    }
    return await GoodsCat.find({ parent: this._id });
  }

  /**
   * 获取当前分类的所有子分类对象列表
   * @returns {[GoodsCat]}
   */
  async allSubs() {
    let list = await this.subs();
    if (!list.length) {
      return {};
    }

    let subs = {};
    for (let sub of list) {
      if (subs[sub.id]) {
        continue;
      }
      subs[sub.id] = sub;
      let subsubs = await sub.allSubs();
      _lodash2.default.defaults(subs, subsubs);
    }
    return subs;
  }

  /**
   * 获取当前分类的所有父分类对象列表
   * @returns {[GoodsCat]}
   */
  async parents() {
    let cats = [];
    let cat = this;
    while (cat && cat.parent) {
      // $Flow
      cat = await GoodsCat.findById(cat.parent);
      if (cat) {
        cats.push(cat);
      }
    }
    return cats;
  }
}
exports.default = GoodsCat;
GoodsCat.label = 'Goods Category';
GoodsCat.icon = 'th-list';
GoodsCat.defaultColumns = '_id icon pic title parent sort createdAt';
GoodsCat.defaultSort = '-sort';
GoodsCat.searchFields = 'title';
GoodsCat.api = {
  list: 1
};
GoodsCat.relationships = {
  subs: {
    ref: 'GoodsCat',
    path: 'parent',
    title: 'Sub Categories',
    private: true
  },
  goods: {
    ref: 'Goods',
    path: 'cats',
    private: true
  }
};
GoodsCat.fields = {
  title: {
    label: 'Title',
    type: String,
    required: true
  },
  icon: {
    label: 'Icon',
    type: 'image'
  },
  pic: {
    label: 'Banner',
    type: 'image'
  },
  desc: {
    label: 'Description',
    type: String
  },
  parent: {
    label: 'Parent Category',
    type: 'category',
    ref: 'GoodsCat',
    index: true
  },
  subCats: {
    label: 'Sub Categories',
    type: 'relationship',
    ref: 'GoodsCat',
    multi: true,
    hidden: true,
    private: true
  },
  sort: {
    label: 'Sort',
    type: Number,
    default: 0,
    private: true
  },
  createdAt: {
    label: 'Created At',
    type: Date,
    private: true
  }
};