'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

class Help extends _alaska.Model {

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
exports.default = Help;
Help.label = 'Help';
Help.icon = 'info-circle';
Help.defaultColumns = 'title parent sort activated createdAt';
Help.defaultSort = '-sort';
Help.searchFields = 'title content';

Help.defaultFilters = ctx => {
  if (ctx.service.id === 'alaska-admin') return null;
  return {
    activated: true
  };
};

Help.api = {
  paginate: 1,
  list: 1,
  show: 1
};
Help.fields = {
  title: {
    label: 'Title',
    type: String,
    required: true
  },
  parent: {
    label: 'Parent Help',
    type: 'relationship',
    ref: 'Help'
  },
  relations: {
    label: 'Related Helps',
    ref: ['Help']
  },
  sort: {
    label: 'Sort',
    type: Number,
    private: true,
    default: 0
  },
  activated: {
    label: 'Activated',
    private: true,
    type: Boolean
  },
  createdAt: {
    label: 'Created At',
    type: Date
  },
  content: {
    label: 'Content',
    type: 'html',
    default: '',
    group: 'content'
  }
};