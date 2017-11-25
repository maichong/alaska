'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

class Feedback extends _alaska.Model {

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
exports.default = Feedback;
Feedback.label = 'Feedback';
Feedback.icon = 'comment';
Feedback.titleField = 'title';
Feedback.defaultColumns = '_id title user content createdAt';
Feedback.defaultSort = '-createdAt';
Feedback.relationships = {
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
Feedback.populations = {
  lastComment: {
    options: {
      sort: 'createdAt'
    },
    populations: {
      user: {}
    }
  }
};
Feedback.scopes = {
  list: '* -comments'
};
Feedback.api = {
  list: 3,
  show: 3,
  create: 3
};
Feedback.actions = {
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
Feedback.groups = {
  reply: {
    title: 'Reply'
  }
};
Feedback.fields = {
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