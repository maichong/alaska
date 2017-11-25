'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

class Sku extends _alaska.Model {

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
exports.default = Sku;
Sku.label = 'Sku';
Sku.icon = 'cubes';
Sku.defaultColumns = 'pic goods desc inventory price valid';
Sku.defaultSort = '-sort';
Sku.noupdate = true;
Sku.noremove = true;
Sku.nocreate = true;
Sku.titleField = 'desc';
Sku.fields = {
  pic: {
    label: 'Main Picture',
    type: 'image',
    required: true
  },
  goods: {
    label: 'Goods',
    type: 'relationship',
    ref: 'Goods',
    index: true
  },
  key: {
    label: 'KEY',
    type: String
  },
  desc: {
    label: 'Description',
    type: String
  },
  price: {
    label: 'Price',
    type: Number,
    default: 0
  },
  discount: {
    label: 'Discount',
    type: Number,
    default: 0
  },
  inventory: {
    label: 'Inventory',
    type: Number,
    default: 0
  },
  volume: {
    label: 'Volume',
    type: Number,
    default: 0,
    private: true
  },
  valid: {
    label: 'Valid',
    type: Boolean,
    private: true
  },
  props: {
    label: 'Goods Properties',
    type: Object
  },
  createdAt: {
    label: 'Created At',
    type: Date
  }
};