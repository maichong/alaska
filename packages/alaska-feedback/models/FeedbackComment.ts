import { Model, RecordId } from 'alaska-model';

export default class FeedbackComment extends Model {
  static label = 'Feedback Comment';
  static icon = 'comments-o';
  static titleField = 'content';
  static defaultColumns = 'feedback user fromAdmin content createdAt';
  static defaultSort = '-createdAt';

  static fields = {
    feedback: {
      label: 'Feedback',
      type: 'relationship',
      ref: 'Feedback',
      index: true,
      required: true
    },
    user: {
      label: 'User',
      type: 'relationship',
      ref: 'alaska-user.User',
      optional: 'alaska-user.User'
    },
    fromAdmin: {
      label: 'From Admin',
      type: Boolean
    },
    createdAt: {
      label: 'Created At',
      type: Date
    },
    content: {
      label: 'Content',
      type: String,
      multiLine: true,
      required: true,
      disabled: [{
        ability: 'alaska-feedback.Feedback.reply'
      }]
    }
  };

  feedback: RecordId;
  user: RecordId;
  createdAt: Date;
  fromAdmin: boolean;
  content: string;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
