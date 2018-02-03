// @flow

import { Model } from 'alaska';

export default class Help extends Model<Help> {
  static label = 'Help';
  static icon = 'info-circle';
  static defaultColumns = 'title parent sort activated createdAt';
  static defaultSort = '-sort';
  static searchFields = 'title content';

  static defaultFilters = (ctx: Alaska$Context) => {
    if (ctx.service.id === 'alaska-admin') return null;
    return {
      activated: true
    };
  };

  static api = {
    paginate: 1,
    list: 1,
    show: 1
  };

  static fields = {
    title: {
      label: 'Title',
      type: String,
      required: true
    },
    parent: {
      label: 'Parent Help',
      type: 'relationship',
      ref: 'Help'
    },
    relations: {
      label: 'Related Helps',
      ref: ['Help']
    },
    sort: {
      label: 'Sort',
      type: Number,
      private: true,
      default: 0
    },
    activated: {
      label: 'Activated',
      private: true,
      type: Boolean
    },
    createdAt: {
      label: 'Created At',
      type: Date
    },
    content: {
      label: 'Content',
      type: 'html',
      default: '',
      group: 'content'
    }
  };
  title: string;
  parent: Object;
  relations: Object[];
  sort: number;
  activated: boolean;
  createdAt: Date;
  content: string;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
