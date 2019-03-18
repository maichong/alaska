import { Model, RecordId } from 'alaska-model';

export default class City extends Model {
  static label = 'City';
  static icon = 'map-signs';
  static defaultColumns = 'code initial name tel zip isHot parent level sort createdAt';
  static filterFields = 'level?switch&nolabel @search';
  static defaultSort = 'initial code';
  static titleField = 'name';
  static searchFields = 'code name tel zip';

  static api = {
    paginate: 1,
    list: 1,
  };

  static fields = {
    code: {
      label: 'Code',
      type: String
    },
    name: {
      label: 'Name',
      type: String,
      required: true
    },
    initial: {
      label: 'Initial',
      type: String
    },
    tel: {
      label: 'Tel Code',
      type: String
    },
    zip: {
      label: 'Zip Code',
      type: String
    },
    isHot: {
      label: 'Is Hot',
      type: Boolean
    },
    parent: {
      label: 'Parent City',
      type: 'relationship',
      ref: 'City'
    },
    level: {
      label: 'Level',
      type: 'select',
      default: 0,
      number: true,
      options: [{
        label: 'Province',
        value: 1
      }, {
        label: 'City',
        value: 2
      }, {
        label: 'District',
        value: 3
      }]
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

  code: string;
  name: string;
  initial: string;
  tel: string;
  zip: string;
  isHot: boolean;
  parent: RecordId;
  level: number;
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
