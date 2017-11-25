'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

class PostTopic extends _alaska.Model {

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    if (!this.seoTitle) {
      this.seoTitle = this.title;
    }
  }
}
exports.default = PostTopic;
PostTopic.label = 'Post Topic';
PostTopic.icon = 'hashtag';
PostTopic.defaultColumns = 'pic title summary commentCount hots createdAt';
PostTopic.defaultSort = 'createdAt';
PostTopic.searchFields = 'title summary';
PostTopic.api = {
  paginate: 1,
  show: 1
};
PostTopic.fields = {
  title: {
    label: 'Title',
    type: String,
    required: true
  },
  pic: {
    label: 'Main Picture',
    type: 'image'
  },
  summary: {
    label: 'Summary',
    type: String,
    default: ''
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
  template: {
    label: 'Page Template',
    type: String,
    default: ''
  },
  createdAt: {
    label: 'Created At',
    type: Date
  }
};