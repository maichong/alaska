'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _alaskaBalance = require('alaska-balance');

var _alaskaBalance2 = _interopRequireDefault(_alaskaBalance);

var _Goods = require('alaska-goods/models/Goods');

var _Goods2 = _interopRequireDefault(_Goods);

var _Sku = require('alaska-goods/models/Sku');

var _Sku2 = _interopRequireDefault(_Sku);

var _Order = require('../models/Order');

var _Order2 = _interopRequireDefault(_Order);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class OrderItem extends _alaska.Model {

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
exports.default = OrderItem;
OrderItem.label = 'Order Item';
OrderItem.icon = 'list-ol';
OrderItem.defaultColumns = 'title order goods skuDesc price discount total quantity createdAt';
OrderItem.defaultSort = '-sort';
OrderItem.nocreate = true;
OrderItem.noupdate = true;
OrderItem.noremove = true;
OrderItem.fields = {
  pic: {
    label: 'Main Picture',
    type: 'image',
    required: true
  },
  title: {
    label: 'Title',
    type: String,
    required: true
  },
  order: {
    label: 'Order',
    ref: 'Order',
    index: true
  },
  goods: {
    label: 'Goods',
    ref: 'alaska-goods.Goods',
    optional: true
  },
  sku: {
    label: 'SKU',
    ref: 'alaska-goods.Sku',
    optional: true
  },
  skuDesc: {
    label: 'SKU Desc',
    type: String
  },
  currency: {
    label: 'Currency',
    type: 'select',
    options: _alaskaBalance2.default.getCurrenciesAsync(),
    default: _alaskaBalance2.default.getDefaultCurrencyAsync().then(cur => cur.value)
  },
  price: {
    label: 'Price',
    type: Number
  },
  discount: {
    label: 'Discount',
    type: Number
  },
  quantity: {
    label: 'Quantity',
    type: Number
  },
  shipping: {
    label: 'Shipping',
    type: Number
  },
  total: {
    // total = (discount || price) * quantity
    label: 'Total Amount',
    type: Number
  },
  createdAt: {
    label: '添加时间',
    type: Date
  }
};