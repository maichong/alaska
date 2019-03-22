import { Model } from 'alaska-model';
import { Image } from 'alaska-field-image';

export default class ExpressCompany extends Model {
  static label = 'Express Company';
  static icon = 'truck';
  static defaultColumns = 'pic id title sort createdAt';
  static defaultSort = '-sort';

  static api = {
    paginate: 1,
    list: 1,
    count: 1,
  };

  static fields = {
    _id: {
      type: String,
      required: true
    },
    title: {
      label: 'Title',
      type: String,
      required: true
    },
    logo: {
      label: 'Logo',
      type: 'image'
    },
    sort: {
      label: 'Sort',
      type: Number,
      default: 0
    },
    createdAt: {
      label: 'Created At',
      type: Date
    }
  };

  title: string;
  logo: Image;
  sort: number;
  createdAt: Date;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
