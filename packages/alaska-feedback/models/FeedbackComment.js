'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

class FeedbackComment extends _alaska.Model {

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
exports.default = FeedbackComment;
FeedbackComment.label = 'Feedback Comment';
FeedbackComment.icon = 'comments-o';
FeedbackComment.titleField = 'content';
FeedbackComment.defaultColumns = 'feedback user fromAdmin content createdAt';
FeedbackComment.defaultSort = '-createdAt';
FeedbackComment.populations = {
  user: {
    select: ':tiny'
  }
};
FeedbackComment.api = {
  create: 3
};
FeedbackComment.fields = {
  feedback: {
    label: 'Feedback',
    ref: 'Feedback',
    index: true,
    required: true,
    private: true
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
  fromAdmin: {
    label: 'From Admin',
    type: Boolean
  },
  content: {
    label: 'Content',
    type: String,
    multiLine: true,
    required: true
  }
};