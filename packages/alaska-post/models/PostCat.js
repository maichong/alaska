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

class PostCat extends _alaska.Model {

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }

  postSave() {
    if (this.parent) {
      _3.default.run('UpdateCatRef', { cat: this.parent });
    }
  }

  postRemove() {
    if (this.parent) {
      _3.default.run('UpdateCatRef', { cat: this.parent });
    }
  }

  /**
   * 获取当前分类的子分类对象列表
   * @returns {[PostCat]}
   */
  async subs() {
    if (this.populated('subCats')) {
      return this.subCats;
    }
    return await PostCat.find({ parent: this._id });
  }

  /**
   * 获取当前分类的所有子分类对象列表
   * @returns {{}}
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
}
exports.default = PostCat;
PostCat.label = 'Post Category';
PostCat.icon = 'paperclip';
PostCat.defaultColumns = '_id title parent sort createdAt';
PostCat.defaultSort = '-sort';
PostCat.searchFields = 'title';
PostCat.autoSelect = false;
PostCat.api = {
  all: 1,
  list: 1
};
PostCat.relationships = {
  subs: {
    ref: 'PostCat',
    path: 'parent',
    title: 'Sub Categories',
    private: true
  }
};
PostCat.fields = {
  title: {
    label: 'Title',
    type: String,
    required: true
  },
  parent: {
    label: 'Parent Category',
    type: 'category',
    ref: 'PostCat',
    index: true
  },
  subCats: {
    label: 'Sub Categories',
    ref: 'PostCat',
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