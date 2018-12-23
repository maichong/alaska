import { RecordId, Model } from 'alaska-model';
import PostCat from './PostCat';
import { ObjectID } from 'mongodb';

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
      select: ':tiny'
    },
    cat: {
      select: 'title'
    },
    relations: {
      select: ':tiny'
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
      type: 'relationship',
      ref: 'PostCat'
    },
    cats: {
      label: 'Categories',
      type: 'relationship',
      ref: 'PostCat',
      multi: true,
      hidden: true,
      protected: true
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
      type: 'relationship',
      ref: 'PostTag',
      multi: true,
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
      type: 'relationship',
      ref: 'Post',
      multi: true,
    },
    topics: {
      label: 'Related Topic',
      type: 'relationship',
      ref: 'PostTopic',
      multi: true
    },
    createdAt: {
      label: 'Created At',
      type: Date
    }
  };
  title: string;
  user: ObjectID;
  cat: RecordId;
  cats: RecordId[];
  seoTitle: string;
  seoKeywords: string;
  seoDescription: string;
  summary: string;
  pic: ObjectID;
  content: string;
  tags: ObjectID[];
  source: string;
  commentCount: number;
  hots: number;
  recommend: boolean;
  relations: ObjectID[];
  topics: ObjectID[];
  createdAt: Date;

  async preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    if (!this.seoTitle) {
      this.seoTitle = this.title;
    }
    if (this.cat) {
      let cats: RecordId[] = [];
      if (this.cat) {
        let catTemp: PostCat = await PostCat.findById(this.cat);
        if (catTemp) {
          cats.push(catTemp._id);
        }
        while (catTemp && catTemp.parent) {
          let c: PostCat = await PostCat.findById(catTemp.parent);
          catTemp = c;
          cats.push(catTemp._id);
        }
        // cats = cats.map((cat: ObjectID) => cat);
      }
      this.cats = cats;
    }
  }
}
