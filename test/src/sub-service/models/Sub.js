/**
 * @copyright Maichong Software Ltd. 2018 http://maichong.it
 * @date 2018-01-25
 * @author Liang <liang@maichong.it>
 */

import { Model } from '../../../modules/alaska';

export default class Sub extends Model {
  static label = 'Sub';
  static icon = '';
  static titleField = 'title';
  static defaultColumns = 'title sort createdAt';
  static defaultSort = '-sort';

  static groups = {};

  static fields = {
    title: {
      label: 'Title',
      type: String,
      required: true
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

  static postRegister() {
    console.log('Sub registered');
  }

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
