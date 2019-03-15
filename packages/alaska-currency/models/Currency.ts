import { Model } from 'alaska-model';

export default class Currency extends Model {
  static label = 'Currency';
  static icon = 'money';
  static defaultColumns = '_id title unit precision format rate isDefault createdAt';
  static defaultSort = '_id';

  static api = {
    paginate: 0,
    list: 0,
    count: 0,
    show: 0,
    create: 0,
    update: 0,
    updateMulti: 0,
    remove: 0,
    removeMulti: 0,
    watch: 0
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
    unit: {
      label: 'Unit',
      type: String,
      default: ''
    },
    precision: {
      label: 'Precision',
      type: Number,
      default: 2
    },
    format: {
      label: 'Format',
      type: String,
      default: '0,0.00'
    },
    rate: {
      label: 'Exchange Rate',
      type: Number,
      default: 1
    },
    isDefault: {
      label: 'Default Currency',
      type: Boolean,
    },
    createdAt: {
      label: 'Created At',
      type: Date
    }
  };

  title: string;
  unit: string;
  format: string;
  precision: number;
  rate: number;
  isDefault: boolean;
  createdAt: Date;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
