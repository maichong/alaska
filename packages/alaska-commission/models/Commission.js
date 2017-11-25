'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _alaskaBalance = require('alaska-balance');

var _alaskaBalance2 = _interopRequireDefault(_alaskaBalance);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Commission extends _alaska.Model {

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
exports.default = Commission;
Commission.label = 'Commission';
Commission.icon = 'jpy';
Commission.titleField = 'title';
Commission.defaultColumns = 'title user contributor order amount level state createdAt balancedAt';
Commission.defaultSort = '-createdAt';
Commission.api = {
  paginate: 3,
  list: 3
};
Commission.populations = {
  contributor: {
    select: ':tiny'
  }
};
Commission.actions = {
  balance: {
    title: 'Balance now',
    style: 'success',
    sled: 'Balance',
    depends: {
      state: 0
    }
  }
};
Commission.fields = {
  title: {
    label: 'Title',
    type: String,
    required: true
  },
  user: {
    label: 'User',
    ref: 'alaska-user.User',
    index: true
  },
  contributor: {
    label: 'Contributor',
    ref: 'alaska-user.User'
  },
  order: {
    label: 'Order',
    ref: 'alaska-order.Order',
    optional: true
  },
  main: {
    label: 'Main Commission',
    ref: 'Commission',
    private: true
  },
  level: {
    label: 'Level',
    type: Number
  },
  currency: {
    label: 'Currency',
    type: 'select',
    options: _alaskaBalance2.default.getCurrenciesAsync(),
    default: _alaskaBalance2.default.getDefaultCurrencyAsync().then(cur => cur.value)
  },
  amount: {
    label: 'Amount',
    type: Number,
    default: 0
  },
  state: {
    label: 'State',
    type: 'select',
    number: true,
    default: 0,
    options: [{
      label: 'Unbalanced',
      value: 0
    }, {
      label: 'Balanced',
      value: 1
    }, {
      label: 'Invalid',
      value: -1
    }]
  },
  error: {
    label: 'Error',
    type: String
  },
  createdAt: {
    label: 'Created At',
    type: Date
  },
  balancedAt: {
    label: 'Balanced At',
    type: Date
  }
};