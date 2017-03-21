// @flow

import _ from 'lodash';
import { Model } from 'alaska';
import GoodsCat from './GoodsCat';
import GoodsProp from './GoodsProp';

export default class GoodsPropValue extends Model {

  static label = 'Property Values';
  static icon = 'square';
  static defaultColumns = 'title prop common sort createdAt';
  static defaultSort = '-sort -createdAt';

  static fields = {
    title: {
      label: 'Title',
      type: String,
      required: true
    },
    prop: {
      label: 'Goods Property',
      ref: GoodsProp,
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

  _id: string|number|Object|any;
  title: string;
  prop: Object;
  cats: Object;
  catsIndex: any;
  common: boolean;
  sort: number;
  createdAt: Date;

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
   * [async] 整理相应属性的属性值
   */
  async processProp() {
    // $Flow findById
    let prop: GoodsProp = await GoodsProp.findById(this.prop);
    if (!prop) return;
    // $Flow find
    let values: GoodsPropValue[] = await GoodsPropValue.find({ prop: prop._id });
    // $Flow v._id类型太多 确认正确
    prop.values = values.map((v: GoodsPropValue) => (v._id));
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
        let cat: GoodsCat = await GoodsCat.findById(cid);
        cats[cid] = cat;
        let subs = await cat.allSubs();
        _.defaults(cats, subs);
      }
      this.catsIndex = Object.keys(cats);
    } else {
      this.catsIndex = undefined;
    }
  }
}
