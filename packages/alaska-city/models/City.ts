import { Model } from 'alaska-model';

export default class City extends Model {
  static label = 'City';
  static icon = 'map-signs';
  static defaultColumns = 'initial name isHot sort createdAt';
  static defaultSort = '-sort initial';
  static titleField = 'name';

  static api = {
    paginate: 1,
    list: 1,
  };

  static fields = {
    name: {
      label: 'Name',
      type: String,
      required: true
    },
    initial: {
      label: 'Initial',
      type: String
    },
    isHot: {
      label: 'Is Hot',
      type: Boolean
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

  name: string;
  initial: string;
  isHot: boolean;
  sort: number;
  createdAt: Date;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    if (!this.initial) {
      this.initial = (this.name || '')[0];
    }
  }
}
