'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _ = require('../');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Role extends _alaska.Model {

  async preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }

  async postSave() {
    await _2.default.clearCache();
  }

  async postRemove() {
    await _2.default.clearCache();
  }

  /**
   * 判断角色是否具有某权限
   * @param id
   * @returns {Promise<boolean>}
   */
  async hasAbility(id) {
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
exports.default = Role;
Role.label = 'Role';
Role.icon = 'users';
Role.defaultSort = '-sort';
Role.defaultColumns = '_id title sort createdAt';
Role.searchFields = 'title';
Role.fields = {
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