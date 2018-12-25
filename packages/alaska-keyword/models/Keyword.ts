import { Model } from 'alaska-model';

export default class Keyword extends Model {
  static label = 'Keyword';
  static icon = 'search';
  static defaultColumns = 'title hot createdAt';
  static defaultSort = '-hot';
  static listLimit = 10;

  static api = {
    list: 1
  };

  static fields = {
    title: {
      label: 'Keyword',
      type: String,
      unique: true,
      required: true
    },
    hot: {
      label: 'Hot',
      type: Number,
      default: 0
    },
    createdAt: {
      label: 'Created At',
      type: Date
    }
  };

  title: string;
  hot: number;
  createdAt: Date;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
