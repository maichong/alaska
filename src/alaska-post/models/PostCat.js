// @flow

import _ from 'lodash';
import { Model } from 'alaska';
import service from '../';

export default class PostCat extends Model<PostCat> {
  static label = 'Post Category';
  static icon = 'paperclip';
  static defaultColumns = '_id title parent sort createdAt';
  static defaultSort = '-sort';
  static searchFields = 'title';

  static autoSelect = false;

  static api = {
    all: 1,
    list: 1
  };

  static relationships = {
    subs: {
      ref: 'PostCat',
      path: 'parent',
      title: 'Sub Categories',
      private: true
    }
  };

  static fields = {
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
  title: string;
  parent: Object;
  subCats: Object[];
  sort: number;
  createdAt: Date;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }

  postSave() {
    if (this.parent) {
      service.run('UpdateCatRef', { cat: this.parent });
    }
  }

  postRemove() {
    if (this.parent) {
      service.run('UpdateCatRef', { cat: this.parent });
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
      _.defaults(subs, subsubs);
    }
    return subs;
  }
}
