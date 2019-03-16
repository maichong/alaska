import { Model, RecordId } from 'alaska-model';

export default class Image extends Model {
  static label = 'Image';
  static icon = 'picture-o';
  static defaultColumns = 'thumbUrl user name size width height createdAt';
  static defaultSort = '-_id';
  static nocreate = true;
  static noupdate = true;

  static actions = {
    create: {
      sled: 'alaska-image.Create'
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
    thumbUrl: {
      label: 'Thumb',
      type: String,
      cell: 'ImageFieldCell',
      view: 'ImageFieldView'
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
    width: {
      label: 'Width',
      type: Number
    },
    height: {
      label: 'Height',
      type: Number
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
  thumbUrl: string;
  size: number;
  width: number;
  height: number;
  createdAt: Date;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
