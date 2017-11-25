'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

class Link extends _alaska.Model {

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
exports.default = Link;
Link.defaultSort = '-sort';
Link.icon = 'link';
Link.defaultColumns = 'pic title url sort activated createdAt';
Link.api = {
  list: 1
};

Link.defaultFilters = ctx => {
  if (ctx.service.id === 'alaska-admin') return null;
  return {
    activated: true
  };
};

Link.fields = {
  title: {
    label: 'Title',
    type: String,
    required: true
  },
  url: {
    label: 'URL',
    type: String,
    required: true
  },
  pic: {
    label: 'Picture',
    type: 'image'
  },
  activated: {
    label: 'Activated',
    type: Boolean,
    private: true
  },
  sort: {
    label: 'Sort',
    type: Number,
    default: 0,
    private: true
  },
  createdAt: {
    label: 'Created At',
    type: Date,
    private: true
  }
};