import { Model } from 'alaska-model';
import Ability from './Ability';

export default class Role extends Model {
  static label = 'Role';
  static icon = 'users';
  static defaultSort = '-sort';
  static defaultColumns = '_id title sort createdAt';
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
    abilities: {
      label: 'Abilities',
      type: 'relationship',
      ref: Ability,
      multi: true
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

  _id: string;
  id: string;
  title: string;
  abilities: string[];
  sort: number;
  createdAt: Date;

  async preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
