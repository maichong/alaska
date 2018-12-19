import { Model } from 'alaska-model';

export default class PostTag extends Model {
  static label = 'Post Tag';
  static icon = 'tags';
  static defaultColumns = 'title createdAt';
  static defaultSort = 'createdAt';
  static searchFields = 'title';

  static api = {
    list: 1,
    paginate: 1,
    show: 1
  };

  static fields = {
    title: {
      label: 'Tag',
      type: String,
      required: true
    },
    createdAt: {
      label: 'Created At',
      type: Date,
      protected: true
    }
  };
  title: string;
  createdAt: Date;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
