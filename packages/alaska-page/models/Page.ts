import { Model } from 'alaska-model';

export default class Page extends Model {
  static label = 'Page';
  static icon = 'file-text';
  static defaultColumns = '_id title createdAt';
  static defaultSort = '-createdAt';

  static searchFields = 'title';

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
    seoTitle: {
      label: 'SEO Title',
      type: String
    },
    seoKeywords: {
      label: 'SEO Keywords',
      type: String
    },
    seoDescription: {
      label: 'SEO Description',
      type: String
    },
    template: {
      label: 'Page Template',
      type: String
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
  }

  _id: string;
  title: string;
  seoTitle: string;
  seoKeywords: string;
  seoDescription: string;
  template: string;
  createdAt: Date;
  content: string;

  async preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    if (!this.seoTitle) {
      this.seoTitle = this.title;
    }
  }
}
