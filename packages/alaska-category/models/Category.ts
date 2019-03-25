import { NormalError } from 'alaska';
import { RecordId, Model } from 'alaska-model';
import { isIdEqual } from 'alaska-model/utils';
import * as _ from 'lodash';
import { Image } from 'alaska-field-image';
import service from '..';

export default class Category extends Model {
  static label = 'Category';
  static icon = 'th-list';
  static defaultColumns = '_id group parent title icon pic activated sort createdAt';
  static defaultSort = 'parent -sort';
  static searchFields = 'title';
  static filterFields = 'group?switch parent activated @search';
  static api = {
    list: 1,
    paginate: 1
  };

  static relationships = {
    subs: {
      ref: 'Category',
      path: 'parent',
      title: 'Sub Categories',
      protected: true
    },
    goods: {
      ref: 'alaska-goods.Goods',
      optional: 'alaska-goods',
      path: 'cats'
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
      label: 'Picture',
      type: 'image'
    },
    desc: {
      label: 'Description',
      type: String
    },
    group: {
      label: 'Category Group',
      type: 'select',
      default: 'default',
      switch: true,
      index: true,
      required: true,
      options: [{
        label: 'Default',
        value: 'default'
      }, {
        label: 'Goods',
        value: 'goods',
        optional: 'alaska-goods'
      }, {
        label: 'Post',
        value: 'post',
        optional: 'alaska-post'
      }]
    },
    parent: {
      label: 'Parent Category',
      type: 'category',
      ref: 'Category',
      index: true,
      filters: {
        group: ':group'
      }
    },
    parents: {
      label: 'Parents',
      type: 'category',
      ref: 'Category',
      multi: true,
      hidden: true,
      protected: true,
      index: true
    },
    children: {
      label: 'Sub Categories',
      type: 'relationship',
      ref: 'Category',
      multi: true,
      hidden: true,
      protected: true
    },
    activated: {
      label: 'Activated',
      type: Boolean,
      default: true,
      protected: true
    },
    sort: {
      label: 'Sort',
      type: Number,
      default: 0,
      protected: true
    },
    createdAt: {
      label: 'Created At',
      type: Date,
      protected: true
    }
  };

  group: string;
  title: string;
  icon: Image;
  pic: Image;
  desc: string;
  parent: RecordId;
  parents: RecordId[];
  children: RecordId[];
  activated: boolean;
  sort: number;
  createdAt: Date;
  __parentChanged?: boolean;
  __groupChanged?: boolean;

  async preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }

    // 检查父分类
    if (this.parent) {
      if (isIdEqual(this.parent, this.id)) {
        // 父分类不能为自身
        throw new NormalError('Category parent can not be self');
      }
      let parent = await Category.findById(this.parent);
      if (!parent) throw new NormalError('Parent category not found');
      if (_.find(parent.parents, (p) => isIdEqual(p, this.id))) throw new NormalError('Parent category circular dependency');
    }

    if (this.isNew) {
      let old = await Category.findOne({ parent: this.parent, title: this.title, group: this.group });
      if (old) service.error('Category title has already exists');
    }
    this.__parentChanged = this.isNew || this.isModified('parent');
    this.__groupChanged = this.isModified('group');
  }

  postSave() {
    (async () => {
      if (this.__parentChanged) {
        await service.sleds.UpdateCatRef.run({ category: this });
      }
      await Category.updateMany({ parents: this._id }, {
        group: this.group
      });
    })();
  }

  async preRemove() {
    let count = await Category.countDocuments({ parent: this._id });
    if (count) service.error('Can not remove category which has children!');
  }

  postRemove() {
    service.sleds.UpdateCatRef.run({ category: this, removed: true });
  }
}
