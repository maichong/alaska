// @flow

import { Model } from 'alaska';

export default class ChartData extends Model {

  static label = 'Chart Data';
  static hidden = true;
  static defaultColumns = 'source x y';
  static defaultSort = '-x';

  static fields = {
    source: {
      ref: 'ChartSource',
      index: true,
      required: true
    },
    x: {
      type: Object
    },
    y: {
      type: Number,
      default: 0
    }
  };
  source: Object;
  x: Object;
  y: number;
  createdAt:Date;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
