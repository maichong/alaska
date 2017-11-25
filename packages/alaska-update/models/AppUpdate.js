'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

class AppUpdate extends _alaska.Model {

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
exports.default = AppUpdate;
AppUpdate.titleField = 'key';
AppUpdate.icon = 'upload';
AppUpdate.fields = {
  key: {
    type: String,
    index: true
  },
  createdAt: {
    label: 'Created At',
    type: Date
  }
};