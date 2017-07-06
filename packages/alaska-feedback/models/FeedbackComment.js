// @flow

import { Model } from 'alaska';

export default class FeedbackComment extends Model {
  static label = 'Feedback Comment';
  static icon = 'comments-o';
  static titleField = 'content';
  static defaultColumns = 'feedback user fromAdmin content createdAt';
  static defaultSort = '-createdAt';

  static populations = {
    user: {
      select: ':tiny'
    }
  };

  static api = {
    create: 3
  };

  static fields = {
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
  feedback: Object;
  user: User;
  createdAt: Date;
  fromAdmin: boolean;
  content: string;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
