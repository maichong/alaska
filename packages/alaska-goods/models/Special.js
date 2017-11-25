'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

class Special extends _alaska.Model {

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
exports.default = Special;
Special.label = 'Special';
Special.icon = 'hashtag';
Special.titleField = 'title';
Special.defaultColumns = 'pic title sort createdAt';
Special.defaultSort = '-createdAt';
Special.api = {
  paginate: 1,
  show: 1
};
Special.scopes = {
  list: 'title pic createdAt'
};
Special.groups = {
  desc: {
    title: 'Description'
  }
};
Special.fields = {
  title: {
    label: 'Title',
    type: String,
    required: true
  },
  pic: {
    label: 'Picture',
    type: 'image'
  },
  seoTitle: {
    label: 'SEO Title',
    type: String,
    default: ''
  },
  seoKeywords: {
    label: 'SEO Keywords',
    type: String,
    default: ''
  },
  seoDescription: {
    label: 'SEO Description',
    type: String,
    default: ''
  },
  goods: {
    label: 'Goods List',
    ref: ['Goods']
  },
  createdAt: {
    label: 'Created At',
    type: Date
  },
  desc: {
    label: 'Description',
    type: 'html',
    default: '',
    group: 'desc',
    horizontal: false,
    nolabel: true
  }
};