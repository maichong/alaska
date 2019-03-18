import { Model } from 'alaska-model';

export default class Notice extends Model {
  static label = 'Notice';
  static icon = 'bullhorn';
  static defaultColumns = 'title top createdAt';
  static filterFields = 'top createdAt?range @search';
  static defaultSort = '-top -createdAt';

  static api = {
    paginate: 1,
    list: 1,
    show: 1,
  };

  static fields = {
    title: {
      label: 'Title',
      type: String,
      required: true
    },
    top: {
      label: 'Top',
      type: Boolean,
      default: false
    },
    createdAt: {
      label: 'Created At',
      type: Date
    },
    content: {
      label: 'Content',
      type: 'html',
      default: ''
    }
  };

  title: string;
  createdAt: Date;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
