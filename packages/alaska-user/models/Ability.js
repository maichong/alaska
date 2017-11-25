'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _ = require('../');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Ability extends _alaska.Model {

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
}
exports.default = Ability;
Ability.label = 'Ability';
Ability.icon = 'unlock-alt';
Ability.defaultColumns = '_id title service createdAt';
Ability.searchFields = 'title';
Ability.fields = {
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