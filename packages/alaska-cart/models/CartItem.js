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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class CartItem extends _alaska.Model {

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
exports.default = CartItem;
CartItem.label = 'Cart Item';
CartItem.icon = 'shopping-cart';
CartItem.defaultColumns = 'pic title user goods price sku createdAt';
CartItem.defaultSort = '-sort';
CartItem.noupdate = true;
CartItem.nocreate = true;
CartItem.defaultLimit = 100;
CartItem.api = {
  list: 3,
  create: 3,
  remove: 3
};
CartItem.fields = {
  pic: {
    label: 'Picture',
    type: 'image'
  },
  title: {
    label: 'Title',
    type: String,
    required: true
  },
  goods: {
    label: 'Goods',
    ref: 'alaska-goods.Goods'
  },
  sku: {
    label: 'SKU',
    ref: 'alaska-goods.Sku'
  },
  skuDesc: {
    label: 'SKU Desc',
    type: String
  },
  user: {
    label: 'User',
    ref: 'alaska-user.User',
    index: true,
    private: true
  },
  currency: {
    label: 'Currency',
    type: 'select',
    options: _alaskaBalance2.default.getCurrenciesAsync(),
    default: _alaskaBalance2.default.getDefaultCurrencyAsync().then(cur => cur.value),
    group: 'price'
  },
  price: {
    label: 'Price',
    type: Number,
    default: 0,
    format: '0.00'
  },
  discount: {
    label: 'Discount',
    type: Number,
    default: 0,
    format: '0.00'
  },
  quantity: {
    label: 'Quantity',
    type: Number,
    default: 1
  },
  createdAt: {
    label: 'Created At',
    type: Date
  }
};