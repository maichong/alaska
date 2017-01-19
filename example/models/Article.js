import alaska, { Model } from 'alaska';

export default class Article extends Model {
  static label = 'Article';
  static api = {
    list: alaska.PUBLIC,
    show: alaska.PUBLIC
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
    content: {
      label: 'Content',
      type: 'html'
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
