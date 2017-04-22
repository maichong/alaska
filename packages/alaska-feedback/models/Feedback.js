// @flow

import { Model } from 'alaska';

export default class Feedback extends Model {

  static label = 'Feedback';
  static icon = 'comment';
  static titleField = 'title';
  static defaultColumns = '_id title user content createdAt';
  static defaultSort = '-createdAt';

  static relationships = {
    comments: {
      title: 'Comments',
      ref: 'FeedbackComment',
      path: 'feedback',
      options: {
        sort: 'createdAt'
      },
      populations: {
        user: {}
      }
    }
  };

  static populations = {
    lastComment: {
      options: {
        sort: 'createdAt'
      },
      populations: {
        user: {}
      }
    }
  };

  static scopes = {
    list: '* -comments'
  };

  static api = {
    list: 3,
    show: 3,
    create: 3
  };

  static actions = {
    reply: {
      tooltip: 'Reply',
      icon: 'reply',
      sled: 'Reply',
      style: 'success',
      depends: '_id',
      disabled: '!newComment',
      post: 'js:location.reload()'
    }
  };

  static groups = {
    reply: {
      title: 'Reply'
    }
  };

  static fields = {
    title: {
      label: 'Title',
      type: String
    },
    user: {
      label: 'User',
      ref: 'alaska-user.User',
      optional: true
    },
    createdAt: {
      label: 'Created At',
      type: Date
    },
    updatedAt: {
      label: 'Updated At',
      type: Date
    },
    content: {
      label: 'Content',
      type: String,
      multiLine: true,
      required: true
    },
    lastComment: {
      label: 'Last Comment',
      ref: 'FeedbackComment'
    },
    newComment: {
      label: 'Reply',
      type: String,
      multiLine: true,
      private: true,
      nolabel: true,
      horizontal: false,
      group: 'reply',
      depends: '_id',
      placeholder: 'Please enter the content to reply...'
    }
  };
  title: string;
  user: Object;
  createdAt: Date;
  updatedAt: Date;
  content: string;
  lastComment: Object|string|number|any;
  newComment: ?string;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    if (!this.updatedAt) {
      this.updatedAt = new Date();
    }
    if (!this.title) {
      this.title = (this.content || '').substr(0, 20);
    }
    this.newComment = undefined;
  }
}
