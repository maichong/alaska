// @flow

import { Model } from 'alaska';

export default class Brand extends Model {

  static label = 'Brand';
  static icon = 'diamond';
  static titleField = 'title';
  static defaultColumns = 'icon logo pic title sort createdAt';
  static defaultSort = '-sort';

  static api = {
    list: 1,
    show: 1
  };

  static fields = {
    title: {
      label: 'Title',
      type: String,
      required: true
    },
    brief: {
      label: 'Brief',
      type: String
    },
    icon: {
      label: 'Icon',
      type: 'image'
    },
    logo: {
      label: 'Logo',
      type: 'image'
    },
    pic: {
      label: 'Picture',
      type: 'image'
    },
    initial: {
      label: 'Initial',
      type: String,
      index: true
    },
    sort: {
      label: 'Sort',
      type: Number,
      default: 0
    },
    createdAt: {
      label: 'Created At',
      type: Date
    },
    desc: {
      label: 'Description',
      type: 'html',
      default: ''
    }
  };
  title: string;
  brief: string;
  icon: Object;
  logo: Object;
  pic: Object;
  initial: string;
  sort: number;
  createdAt: Date;
  desc: string;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
