import { Model } from 'alaska-model';
import { Context } from 'alaska-http';

function defaultFilters(ctx: Context) {
  if (ctx.request.url.startsWith('/admin/')) return null;
  return {
    activated: true
  };
}

export default class Help extends Model {
  static label = 'Help';
  static icon = 'info-circle';
  static defaultColumns = 'title parent sort activated createdAt';
  static defaultSort = '-sort';
  static searchFields = 'title content';
  static defaultFilters = defaultFilters;

  static groups = {
    content: {
      title: 'Content',
      panel: true
    }
  }

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
      type: 'relationship',
      ref: 'Help',
      multi: true
    },
    sort: {
      label: 'Sort',
      type: Number,
      protected: true,
      default: 0
    },
    activated: {
      label: 'Activated',
      protected: true,
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
  parent: string;
  relations: string[];
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
