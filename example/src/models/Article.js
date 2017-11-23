import { Model } from 'alaska';

export default class Article extends Model {
  static label = 'Article';
  static titleField = 'title';
  static defaultColumns = 'title cat hot createdAt';
  static api = {
    paginate: 1,
    show: 1,
    create: 1,
    updateMulti: 1,
    removeMulti: 1
  };

  static actions = {
    hot: {
      title: 'Hot',
      sled: 'SetHot',
      style: 'success',
      depends: '_id',
      list: true,
      needRecords: 1,
      editor: true
    }
  };

  static fields = {
    title: {
      label: 'Title',
      type: String
    },
    cat: {
      label: 'Category',
      ref: 'ArticleCat',
      required: true
    },
    hot: {
      label: 'Hot',
      type: Boolean,
    },
    content: {
      label: 'Content',
      type: String
    },
    createdAt: {
      label: 'Created At',
      type: Date
    }
  };

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
