import { Model, RecordId } from 'alaska-model';

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
      protected: true,
      options: {
        sort: 'createdAt'
      }
    }
  };

  static populations = {
    lastComment: {
      auto: true
    }
  };

  static api = {
    paginate: 2,
    list: 2,
    show: 2,
    create: 2
  };

  static actions = {
    reply: {
      icon: 'reply',
      tooltip: 'Reply',
      title: 'Reply',
      sled: 'Reply',
      color: 'success',
      hidden: '!_id',
      disabled: '!newComment',
      post: 'js:location.reload()'
    }
  };

  static groups = {
    reply: {
      title: 'Reply',
      full: true,
    }
  };

  static fields = {
    title: {
      label: 'Title',
      type: String
    },
    user: {
      label: 'User',
      type: 'relationship',
      ref: 'alaska-user.User',
      optional: 'alaska-user.User'
    },
    createdAt: {
      label: 'Created At',
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
      type: 'relationship',
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
      hidden: '!_id',
      placeholder: 'Please enter the content to reply...'
    }
  };

  title: string;
  user: RecordId;
  createdAt: Date;
  content: string;
  lastComment: RecordId;
  newComment?: string;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    if (!this.title) {
      this.title = (this.content || '').substr(0, 20);
    }
    this.newComment = null;
  }
}
