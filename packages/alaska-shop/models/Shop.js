'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _Brand = require('alaska-goods/models/Brand');

var _Brand2 = _interopRequireDefault(_Brand);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Shop extends _alaska.Model {

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
exports.default = Shop;
Shop.label = 'Shop';
Shop.icon = 'home';
Shop.defaultColumns = 'logo title user brand activated createdAt';
Shop.defaultSort = '-createdAt';

Shop.defaultFilters = ctx => {
  if (ctx.service.id === 'alaska-admin') return null;
  return {
    activated: true
  };
};

Shop.api = {
  paginate: 1,
  show: 1
};
Shop.fields = {
  title: {
    label: 'Title',
    type: String,
    required: true
  },
  logo: {
    label: 'Logo',
    type: 'image'
  },
  user: {
    label: 'User',
    ref: 'alaska-user.User',
    required: true
  },
  brand: {
    label: 'Brand',
    ref: 'alaska-goods.Brand',
    optional: true
  },
  activated: {
    label: 'Activated',
    type: Boolean,
    default: true,
    private: true
  },
  createdAt: {
    label: 'Created At',
    type: Date
  },
  desc: {
    label: 'Description',
    type: 'html'
  }
};