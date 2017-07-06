// @flow

import _ from 'lodash';
import { Model } from 'alaska';
import service from '../';
import GoodsCat from './GoodsCat';

/**
 * @class GoodsProp
 * @extends Model
 */
export default class GoodsProp extends Model {
  static label = 'Goods Properties';
  static icon = 'th';
  static defaultColumns = 'title common required multi sku filter input activated sort createdAt';
  static defaultSort = '-sort';
  static searchFields = 'title';

  static api = {
    paginate: 1,
    list: 1,
  };

  static populations = {
    values: {
      select: 'title _common _catsIndex'
    }
  };

  static relationships = {
    values: {
      ref: 'GoodsPropValue',
      path: 'prop',
      private: true
    }
  };

  static groups = {
    editor: {
      title: 'Create Property Values'
    }
  };

  static fields = {
    title: {
      label: 'Title',
      type: String,
      required: true
    },
    cats: {
      label: 'Categories',
      type: 'category',
      ref: 'GoodsCat',
      multi: true,
      private: true,
      disabled: 'common'
    },
    catsIndex: {
      label: 'Categories',
      ref: ['GoodsCat'],
      index: true,
      hidden: true,
      private: true
    },
    common: {
      label: 'Common',
      default: false,
      type: Boolean
    },
    required: {
      label: 'Required',
      type: Boolean
    },
    multi: {
      label: 'Multi',
      type: Boolean
    },
    sku: {
      label: 'SKU',
      type: Boolean
    },
    filter: {
      label: 'Filter',
      type: Boolean
    },
    input: {
      label: 'Input',
      type: Boolean
    },
    checkbox: {
      label: 'Checkbox View',
      type: Boolean,
      disabled: 'input'
    },
    switch: {
      label: 'Switch View',
      type: Boolean,
      disabled: 'input'
    },
    sort: {
      label: 'Sort',
      type: Number,
      default: 0,
      private: true
    },
    help: {
      label: 'Help',
      type: String,
      help: 'This message will display in the goods editor.'
    },
    values: {
      label: 'Values',
      ref: ['GoodsPropValue'],
      hidden: true
    },
    activated: {
      label: 'Activated',
      type: Boolean,
      private: true
    },
    createdAt: {
      label: 'Created At',
      type: Date,
      private: true
    },
    valueEditor: {
      type: String,
      view: 'GoodsPropsValueEditor',
      private: true,
      group: 'editor',
      depends: '_id',
      filter: false,
      cell: false
    }
  };
  _id: string|number|Object|any;
  title: string;
  cats: Object;
  catsIndex: any;
  common: boolean;
  required: boolean;
  multi: boolean;
  sku: boolean;
  filter: boolean;
  input: boolean;
  checkbox: boolean;
  switch: boolean;
  sort: number;
  help: string;
  values: Object[];
  activated: boolean;
  createdAt: Date;
  valueEditor: string;

  async preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    if (this.isNew || this.isModified('cats') || this.isModified('common')) {
      await this.updateCatsIndex();
    }
  }

  async preRemove() {
    const GoodsPropValue = service.model('GoodsPropValue');
    if (await GoodsPropValue.count({ prop: this._id })) {
      throw new Error('Can not remove this goods prop, please remove the values first!');
    }
  }

  /**
   * 更新本属性所对应分类的关联索引
   */
  async updateCatsIndex() {
    if (!this.common && this.cats.length) {
      let cats = {};
      for (let cid of this.cats) {
        if (cats[cid]) {
          continue;
        }
        // $Flow
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
