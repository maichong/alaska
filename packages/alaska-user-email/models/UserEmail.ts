import { Model, RecordId } from 'alaska-model';

export default class UserEmail extends Model {
  static label = 'User Email';
  static icon = '';
  static defaultColumns = 'title sort createdAt';
  static defaultSort = '-sort';

  static api = {
    list: 2,
    create: 2,
    remove: 2,
  };

  static fields = {
    email: {
      label: 'Email',
      type: String,
      index: true,
      required: true,
      unique: true
    },
    user: {
      label: 'User',
      type: 'relationship',
      ref: 'alaska-user.User',
      required: true,
      index: true
    },
    createdAt: {
      label: 'Created At',
      type: Date
    }
  };

  email: string;
  user: RecordId;
  createdAt: Date;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
