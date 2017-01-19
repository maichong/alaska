// @flow

import { Model } from 'alaska';

export default class Special extends Model {

  static label = 'Special';
  static icon = 'hashtag';
  static titleField = 'title';
  static defaultColumns = 'pic title sort createdAt';
  static defaultSort = '-createdAt';

  static api = {
    list: 1,
    show: 1
  };

  static scopes = {
    list: 'title pic createdAt'
  };

  static groups = {
    desc: {
      label: 'Description',
      className: 'noborder'
    }
  };

  static fields = {
    title: {
      label: 'Title',
      type: String,
      required: true
    },
    pic: {
      label: 'Picture',
      type: 'image'
    },
    seoTitle: {
      label: 'SEO Title',
      type: String,
      default: ''
    },
    seoKeywords: {
      label: 'SEO Keywords',
      type: String,
      default: ''
    },
    seoDescription: {
      label: 'SEO Description',
      type: String,
      default: ''
    },
    goods: {
      label: 'Goods List',
      ref: ['Goods']
    },
    createdAt: {
      label: 'Created At',
      type: Date
    },
    desc: {
      label: 'Description',
      type: 'html',
      default: '',
      group: 'desc',
      horizontal: false,
      nolabel: true
    }
  };

  title: string;
  pic: Object;
  seoTitle: string;
  seoKeywords: string;
  seoDescription: string;
  goods: Object[];
  createdAt: Date;
  desc: string;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
