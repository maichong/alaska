'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _Post = require('./Post');

var _Post2 = _interopRequireDefault(_Post);

var _PostTopic = require('./PostTopic');

var _PostTopic2 = _interopRequireDefault(_PostTopic);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class PostComment extends _alaska.Model {

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }

  async postSave() {
    let post;
    let filters = {};
    if (this.post) {
      // $Flow  findById
      post = await _Post2.default.findById(this.post);
      filters.post = this.post;
    } else if (this.topic) {
      // $Flow  findById
      post = await _PostTopic2.default.findById(this.topic);
      filters.topic = this.topic;
    }
    if (!post) return;
    post.commentCount = await PostComment.count(filters);
    post.save();
  }
}
exports.default = PostComment;
PostComment.label = 'Post Comment';
PostComment.icon = 'comments';
PostComment.defaultColumns = 'post topic user content createdAt';
PostComment.defaultSort = '-createdAt';
PostComment.searchFields = 'content';
PostComment.api = {
  paginate: 1,
  create: 2
};
PostComment.populations = {
  user: {
    path: 'user',
    select: ':tiny'
  },
  commentTo: {}
};
PostComment.fields = {
  post: {
    label: 'Post',
    ref: 'Post',
    index: true
  },
  topic: {
    label: 'Topic',
    ref: 'PostTopic',
    index: true
  },
  user: {
    label: 'User',
    type: 'relationship',
    ref: 'alaska-user.User',
    noupdate: true,
    index: true
  },
  content: {
    label: 'Content',
    type: String,
    default: ''
  },
  commentTo: {
    label: 'Reply To',
    ref: 'PostComment'
  },
  agree: {
    label: 'Agreed',
    type: Number,
    default: 0
  },
  oppose: {
    label: 'Opposed',
    type: Number,
    default: 0
  },
  createdAt: {
    label: 'Created At',
    type: Date
  }
};