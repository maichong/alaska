// @flow


import { Model } from 'alaska';

export default class AppUpdate extends Model {
  static titleField = 'key';
  static icon = 'upload';

  static fields = {
    key: {
      type: String,
      index: true
    },
    createdAt: {
      label: 'Created At',
      type: Date
    }
  };
  key: string;
  createdAt: Date;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
