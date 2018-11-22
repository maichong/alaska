import { Model } from 'alaska-model';
import service from '..';

export default class Ability extends Model {
  static label = 'Ability';
  static icon = 'unlock-alt';
  static defaultColumns = '_id title service createdAt';

  static searchFields = 'title';

  static fields = {
    _id: {
      type: String,
      required: true
    },
    title: {
      label: 'Title',
      type: String
    },
    service: {
      label: 'Service',
      type: String
    },
    createdAt: {
      label: 'Created At',
      type: Date
    }
  };

  _id: string;
  id: string;
  title: string;
  service: string;
  createdAt: Date;

  async preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }

  // async postSave() {
  //   await service.clearCache();
  // }

  // async postRemove() {
  //   await service.clearCache();
  // }
}
