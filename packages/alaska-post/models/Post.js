'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _PostCat = require('./PostCat');

var _PostCat2 = _interopRequireDefault(_PostCat);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Post extends _alaska.Model {

  async preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    if (!this.seoTitle) {
      this.seoTitle = this.title;
    }
    if (this.cat) {
      let cats = [];
      if (this.cat) {
        // $Flow  findById
        let catTemp = await _PostCat2.default.findById(this.cat);
        if (catTemp) {
          cats.push(catTemp);
        }
        while (catTemp && catTemp.parent) {
          // $Flow  findById
          let c = await _PostCat2.default.findById(catTemp.parent);
          catTemp = c;
          cats.push(catTemp);
        }
        // $Flow  cat._id和PostCat不兼容
        cats = cats.map(cat => cat._id);
      }
      this.cats = cats;
    }
  }
}
exports.default = Post;
Post.label = 'Post';
Post.icon = 'file-text-o';
Post.defaultColumns = 'pic title cat user createdAt';
Post.defaultSort = '-createdAt';
Post.searchFields = 'title summary';
Post.autoSelect = false;
Post.api = {
  paginate: 1,
  show: 1
};
Post.populations = {
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
Post.scopes = {
  tiny: 'title hots createdAt',
  list: 'title user summary pic tags commentCount hots createdAt'
};
Post.fields = {
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