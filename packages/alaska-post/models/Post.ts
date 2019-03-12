import { RecordId, Model } from 'alaska-model';
import { Image } from 'alaska-field-image';
import CategoryType from 'alaska-category/models/Category';

export default class Post extends Model {
  static label = 'Post';
  static icon = 'file-text-o';
  static defaultColumns = 'pic title cat user createdAt';
  static defaultSort = '-createdAt';
  static searchFields = 'title summary';
  static filterFields = 'recommend user createdAt?range @search';
  static autoSelect = false;

  static api = {
    paginate: 1,
    list: 1,
    show: 1
  };

  static scopes = {
    list: 'title user summary pic cat hots createdAt'
  };

  static fields = {
    title: {
      label: 'Title',
      type: String,
      required: true
    },
    user: {
      label: 'User',
      type: 'relationship',
      ref: 'alaska-user.User'
    },
    cat: {
      label: 'Category',
      type: 'relationship',
      ref: 'alaska-category.Category',
      optional: 'alaska-category.Category',
      filters: {
        group: 'post'
      }
    },
    cats: {
      label: 'Categories',
      type: 'relationship',
      ref: 'alaska-category.Category',
      optional: 'alaska-category.Category',
      multi: true,
      hidden: true,
      private: true
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
    summary: {
      label: 'Summary',
      type: String,
      default: ''
    },
    pic: {
      label: 'Main Picture',
      type: 'image'
    },
    source: {
      label: 'Source',
      type: String
    },
    hots: {
      label: 'Hots',
      type: Number,
      default: 0
    },
    recommend: {
      label: 'Recommend',
      type: Boolean
    },
    relations: {
      label: 'Related Posts',
      type: 'relationship',
      ref: 'Post',
      multi: true,
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
  user: RecordId;
  cat: RecordId;
  cats: RecordId[];
  seoTitle: string;
  seoKeywords: string;
  seoDescription: string;
  summary: string;
  pic: Image;
  content: string;
  source: string;
  hots: number;
  recommend: boolean;
  relations: RecordId[];
  createdAt: Date;
  // TODO: tags
  // TODO: topics
  // TODO: commentCount

  async preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    if (!this.seoTitle) {
      this.seoTitle = this.title;
    }
    if (this.cat) {
      const Category = Model.lookup('alaska-category.Category') as typeof CategoryType;
      if (!Category) return;
      let cat = await Category.findById(this.cat);
      this.cats = (cat.parents || []).concat(cat._id);
    }
  }
}
