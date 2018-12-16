import { Model } from 'alaska-model';
import * as _ from 'lodash';
import service from '../';

export default class Category extends Model {
  static label = 'Category';
  static icon = 'th-list';
  static defaultColumns = '_id icon pic title parent activated sort createdAt';
  static defaultSort = '-sort';
  static searchFields = 'title';

  static api = {
    list: 1,
    paginate: 1
  };

  static relationships = {
    subs: {
      ref: 'Category',
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
      options: [{
        label: 'Default',
        value: 'default'
      }, {
        label: 'Goods',
        value: 'goods'
      }, {
        label: 'Post',
        value: 'post'
      }]
    },
    parent: {
      label: 'Parent Category',
      type: 'category',
      ref: 'Category',
      index: true
    },
    parents: {
      label: 'Parents',
      type: 'category',
      ref: 'Category',
      multi: true,
      hidden: true,
      private: true,
      index: true
    },
    children: {
      label: 'Sub Categories',
      type: 'relationship',
      ref: 'Category',
      multi: true,
      hidden: true,
      private: true
    },
    activated: {
      label: 'Activated',
      type: Boolean,
      default: true,
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
  parents: Object[];
  children: Object[];
  activated: boolean;
  sort: number;
  createdAt: Date;
  __parentChanged?: boolean;

  async preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    if (this.isNew) {
      let old = await Category.findOne({ parent: this.parent, title: this.title });
      if (old) service.error('Category title has already exists!');
    }
    this.__parentChanged = this.isNew || this.isModified('parent');
  }

  postSave() {
    if (this.__parentChanged) {
      service.sleds.UpdateCatRef.run({ category: this });
    }
  }

  async preRemove() {
    let count = await Category.countDocuments({ parent: this._id });
    if (count) service.error('Can not remove category which has children!');
  }

  postRemove() {
    service.sleds.UpdateCatRef.run({ category: this, removed: true });
  }
}
