'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

class Menu extends _alaska.Model {

  async preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
exports.default = Menu;
Menu.label = 'Menu';
Menu.icon = 'list';
Menu.titleField = 'title';
Menu.defaultColumns = '_id title createdAt';
Menu.defaultSort = '-sort';
Menu.api = { show: 1 };
Menu.fields = {
  _id: {
    type: String,
    required: true
  },
  title: {
    label: 'Title',
    type: String,
    required: true
  },
  items: {
    label: 'Menu Items',
    type: Object,
    default: []
  },
  createdAt: {
    label: 'Created At',
    type: Date,
    private: true
  }
};