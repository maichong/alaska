import { Model } from 'alaska-model';
import Post from './Post';
import PostTopic from './PostTopic';
import { ObjectID } from 'mongodb';

interface Filters {
  post: Object;
  topic: Object;
}

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
      select: ':tiny'
    },
    commentTo: {}
  };

  static fields = {
    post: {
      label: 'Post',
      type: 'relationship',
      ref: 'Post',
      index: true
    },
    topic: {
      label: 'Topic',
      type: 'relationship',
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
      type: 'relationship',
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
  post: ObjectID;
  topic: ObjectID;
  user: ObjectID;
  content: string;
  commentTo: ObjectID;
  agree: number;
  oppose: number;
  createdAt: Date;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }

  async postSave() {
    let post: Post | PostTopic;
    let filters = <Filters>{};
    if (this.post) {
      post = await Post.findById(this.post);
      filters.post = this.post;
    } else if (this.topic) {
      post = await PostTopic.findById(this.topic);
      filters.topic = this.topic;
    }
    if (!post) return;
    post.commentCount = await PostComment.countDocuments(filters);
    post.save();
  }
}
