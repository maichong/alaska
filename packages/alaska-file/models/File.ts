import { Model, RecordId } from 'alaska-model';

export default class File extends Model {
  static label = 'File';
  static icon = 'file-o';
  static defaultColumns = 'user name size createdAt';
  static defaultSort = '-_id';
  static nocreate = true;
  static noupdate = true;

  static actions = {
    create: {
      sled: 'alaska-file.Create'
    }
  };

  static api = {
    paginate: 2,
    list: 2,
    count: 2,
    create: 2
  };

  static fields = {
    user: {
      label: 'User',
      type: 'relationship',
      ref: 'alaska-user.User',
      optional: 'alaska-user'
    },
    name: {
      label: 'Name',
      type: String
    },
    ext: {
      label: 'Extension',
      type: String
    },
    path: {
      label: 'Path',
      type: String
    },
    url: {
      label: 'URL',
      type: String
    },
    size: {
      label: 'Size',
      type: Number,
      default: 0
    },
    createdAt: {
      label: 'Created At',
      type: Date
    }
  };

  user: RecordId;
  name: string;
  ext: string;
  path: string;
  url: string;
  size: number;
  createdAt: Date;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
