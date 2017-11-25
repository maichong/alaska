'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

class Brand extends _alaska.Model {

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
exports.default = Brand;
Brand.label = 'Brand';
Brand.icon = 'diamond';
Brand.titleField = 'title';
Brand.defaultColumns = 'icon logo pic title sort createdAt';
Brand.defaultSort = '-sort';
Brand.api = {
  list: 1,
  paginate: 1,
  show: 1
};
Brand.fields = {
  title: {
    label: 'Title',
    type: String,
    required: true
  },
  brief: {
    label: 'Brief',
    type: String
  },
  icon: {
    label: 'Icon',
    type: 'image'
  },
  logo: {
    label: 'Logo',
    type: 'image'
  },
  pic: {
    label: 'Picture',
    type: 'image'
  },
  initial: {
    label: 'Initial',
    type: String,
    index: true
  },
  sort: {
    label: 'Sort',
    type: Number,
    default: 0
  },
  createdAt: {
    label: 'Created At',
    type: Date
  },
  desc: {
    label: 'Description',
    type: 'html',
    default: ''
  }
};