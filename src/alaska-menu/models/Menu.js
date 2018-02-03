// @flow

import { Model } from 'alaska';

export default class Menu extends Model<Menu> {
  static label = 'Menu';
  static icon = 'list';
  static titleField = 'title';
  static defaultColumns = '_id title createdAt';
  static defaultSort = '-sort';
  static api = { show: 1 };

  static fields = {
    _id: {
      type: String,
      required: true
    },
    title: {
      label: 'Title',
      type: String,
      required: true
    },
    items: {
      label: 'Menu Items',
      type: Object,
      default: []
    },
    createdAt: {
      label: 'Created At',
      type: Date,
      private: true
    }
  };
  _id: String|number|Object|any;
  title: string;
  items: Object;
  createdAt: Date;

  async preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
