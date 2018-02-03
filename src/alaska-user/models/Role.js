// @flow

import { Model } from 'alaska';
import service from '../';

export default class Role extends Model<Role> {
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
      ref: 'Ability',
      multi: true
    },
    sort: {
      label: 'Sort',
      type: Number
    },
    createdAt: {
      label: 'Created At',
      type: Date
    }
  };

  title: string;
  abilities: Object[];
  sort: number;
  createdAt: Date;

  async preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }

  async postSave() {
    await service.clearCache();
  }

  async postRemove() {
    await service.clearCache();
  }

  /**
   * 判断角色是否具有某权限
   * @param id
   * @returns {Promise<boolean>}
   */
  async hasAbility(id: string | Object): Promise<boolean> {
    if (this.abilities) {
      for (let aid of this.abilities) {
        //如果abilities属性中储存的是Ability对象
        if (aid._id && aid._id === id) {
          return true;
        }
        if (aid === id) {
          return true;
        }
      }
    }
    return false;
  }
}
