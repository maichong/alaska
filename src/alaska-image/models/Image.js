// @flow

import { Model } from 'alaska';

export default class Image extends Model<Image> {
  static label = 'Image';
  static icon = 'picture-o';
  static defaultColumns = 'pic user createdAt';
  static defaultSort = '-createdAt';
  static noremove = true;

  static fields = {
    pic: {
      label: 'Picture',
      type: 'image',
      required: true
    },
    user: {
      label: 'User',
      ref: 'alaska-user.User',
      optional: true
    },
    createdAt: {
      label: 'Created At',
      type: Date
    }
  };
  pic: Object;
  user: Object;
  createdAt: Date;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
