import { Model } from 'alaska-model';
import service from '..';

export default class Ability extends Model {
  static label = 'Ability';
  static icon = 'unlock-alt';
  static defaultColumns = '_id title createdAt';
  static filterFields = '@search';
  static searchFields = '_id title';
  static defaultSort = '_id';

  static fields = {
    _id: {
      type: String,
      required: true
    },
    title: {
      label: 'Title',
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
  createdAt: Date;

  _isNew: boolean;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    this._isNew = this.isNew;
    if (['god', 'every'].includes(String(this.id))) throw new Error('Invalid ability id');
  }

  postSave() {
    if (this._isNew) {
      service.clearUserAbilitiesCache();
    }
  }
}
