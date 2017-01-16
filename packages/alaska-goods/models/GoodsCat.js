// @flow

import _ from 'lodash';
import { Model } from 'alaska';
import service from '../';

export default class GoodsCat extends Model {
  static label = 'Goods Category';
  static icon = 'th-list';
  static defaultColumns = '_id icon pic title parent sort createdAt';
  static defaultSort = '-sort';
  static searchFields = 'title';

  static api = {
    list: 1
  };

  static relationships = {
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

  static fields = {
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

  title: string;
  icon: Object;
  pic: Object;
  desc: string;
  parent: Object;
  subCats: Object;
  sort: number;
  createdAt: Date;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }

  postSave() {
    service.clearCache();
    if (this.parent) {
      service.run('UpdateCatRef', { cat: this.parent });
    }
    service.run('UpdatePropRef', { cat: this.id });
  }

  postRemove() {
    service.clearCache();
    if (this.parent) {
      service.run('UpdateCatRef', { cat: this.parent });
    }
    service.run('UpdatePropRef', { cat: this.id });
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
    for (let i of Object.keys(list)) {
      let sub = list[i];
      if (subs[sub.id]) {
        continue;
      }
      subs[sub.id] = sub;
      let subsubs = await sub.allSubs();
      _.defaults(subs, subsubs);
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
      cat = await GoodsCat.findCache(cat.parent);
      if (cat) {
        cats.push(cat);
      }
    }
    return cats;
  }
}
