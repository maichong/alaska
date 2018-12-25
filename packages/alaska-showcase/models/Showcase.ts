import { Model } from 'alaska-model';

export default class Showcase extends Model {
  static label = 'Showcase';
  static icon = 'table';
  static defaultColumns = 'title sort createdAt';
  static defaultSort = '-sort';

  static api = {
    paginate: 1,
    list: 1,
    count: 1,
    show: 1
  };

  static fields = {
    title: {
      label: 'Title',
      type: String,
      required: true
    },
    place: {
      label: 'Place',
      type: 'select',
      switch: true,
      default: 'default',
      options: [{
        label: 'Default',
        value: 'default'
      }]
    },
    sort: {
      label: 'Sort',
      type: Number,
      default: 0
    },
    layout: {
      label: 'Layout',
      type: String,
      default: '2',
      view: 'ShowcaseLayoutSelector',
      filter: '',
      cell: ''
    },
    height: {
      label: 'Height',
      type: Number
    },
    width: {
      label: 'Width',
      type: Number
    },
    items: {
      label: 'Items',
      type: Object,
      default: [] as any[],
      view: 'ShowcaseEditor',
      filter: '',
      cell: ''
    },
    createdAt: {
      label: 'Created At',
      type: Date
    }
  };

  title: string;
  place: string;
  sort: number;
  createdAt: Date;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
