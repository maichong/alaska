// @flow

import { Model } from 'alaska';
import Post from './Post';
import PostTopic from './PostTopic';

export default class PostComment extends Model {
  static label = 'Post Comment';
  static icon = 'comments';
  static defaultColumns = 'post topic user content createdAt';
  static defaultSort = '-createdAt';
  static searchFields = 'content';

  static api = {
    paginate: 1,
    create: 2
  };

  static populations = {
    user: {
      path: 'user',
      select: '@tiny'
    },
    commentTo: {}
  };

  static fields = {
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
      noedit: true,
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
  post: Object;
  topic: Object;
  user: User;
  content: string;
  commentTo: Object;
  agree: number;
  oppose: number;
  createdAt: Date;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }

  async postSave() {
    let post: ?Post|?PostTopic;
    let filters = {};
    if (this.post) {
      // $Flow  findById
      post = await Post.findById(this.post);
      filters.post = this.post;
    } else if (this.topic) {
      // $Flow  findById
      post = await PostTopic.findById(this.topic);
      filters.topic = this.topic;
    }
    if (!post) return;
    post.commentCount = await PostComment.count(filters);
    post.save();
  }
}
