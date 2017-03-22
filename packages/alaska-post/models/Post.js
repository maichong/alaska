// @flow

import { Model } from 'alaska';
import PostCat from './PostCat';

export default class Post extends Model {
  static label = 'Post';
  static icon = 'file-text-o';
  static defaultColumns = 'pic title cat user createdAt';
  static defaultSort = '-createdAt';
  static searchFields = 'title summary';

  static autoSelect = false;

  static api = {
    paginate: 1,
    show: 1
  };

  static populations = {
    tags: {},
    user: {
      select: '@tiny'
    },
    cat: {
      select: 'title'
    },
    relations: {
      select: '@tiny'
    }
  };

  static scopes = {
    tiny: 'title hots createdAt',
    list: 'title user summary pic tags commentCount hots createdAt'
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
      label: 'Post Category',
      type: 'category',
      ref: 'PostCat'
    },
    cats: {
      label: 'Categories',
      ref: ['PostCat'],
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
    content: {
      label: 'Content',
      type: 'html',
      default: ''
    },
    tags: {
      label: 'Tags',
      ref: ['PostTag']
    },
    source: {
      label: 'Source',
      type: String
    },
    commentCount: {
      label: 'Comment Count',
      type: Number,
      default: 0
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
      ref: ['Post']
    },
    topics: {
      label: 'Related Topic',
      ref: ['PostTopic']
    },
    createdAt: {
      label: 'Created At',
      type: Date
    }
  };
  title: string;
  user: User;
  cat: Object;
  cats: Object[];
  seoTitle: string;
  seoKeywords: string;
  seoDescription: string;
  summary: string;
  pic: Object;
  content: string;
  tags: Object[];
  source: string;
  commentCount: number;
  hots: number;
  recommend: boolean;
  relations: Object[];
  topics: Object[];
  createdAt: Date;

  async preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    if (!this.seoTitle) {
      this.seoTitle = this.title;
    }
    if (this.cat) {
      let cats: PostCat[] = [];
      if (this.cat) {
        // $Flow  findById
        let catTemp: PostCat = await PostCat.findById(this.cat);
        if (catTemp) {
          cats.push(catTemp);
        }
        while (catTemp && catTemp.parent) {
          // $Flow  findById
          let c: PostCat = await PostCat.findById(catTemp.parent);
          catTemp = c;
          cats.push(catTemp);
        }
        // $Flow  cat._id和PostCat不兼容
        cats = cats.map((cat: PostCat) => cat._id);
      }
      this.cats = cats;
    }
  }
}
