'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _alaskaBalance = require('alaska-balance');

var _alaskaBalance2 = _interopRequireDefault(_alaskaBalance);

var _ = require('../');

var _2 = _interopRequireDefault(_);

var _OrderLog = require('./OrderLog');

var _OrderLog2 = _interopRequireDefault(_OrderLog);

var _OrderItem = require('./OrderItem');

var _OrderItem2 = _interopRequireDefault(_OrderItem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Order extends _alaska.Model {

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    this.pay = (this.total || 0) + (this.shipping || 0);
    this._logTotal = !this.isNew && this.isModified('total');
    this._logShipping = !this.isNew && this.isModified('shipping');
  }

  postSave() {
    if (this._logTotal) {
      this.createLog('Modified total price');
    }
    if (this._logShipping) {
      this.createLog('Modified shipping fee');
    }
  }

  /**
   * 创建并保存订单日志
   * @param title
   * @returns {*}
   */
  createLog(title) {
    let log = new _OrderLog2.default({ title, order: this });
    log.save();
    return log;
  }

  /**
   * 判断某个GoodsItem能不能合并到此订单
   * @param {OrderItem} item
   * @returns {boolean}
   */
  canAppendItem(item) {
    return !!item;
  }
}
exports.default = Order;
Order.label = 'Order';
Order.icon = 'file-text-o';
Order.defaultColumns = 'pic title user total state createdAt';
Order.defaultSort = '-createdAt';
Order.searchFields = 'title';
Order.nocreate = true;
Order.noremove = true;

Order.defaultFilters = ctx => {
  let field = ctx.service.id === 'alaska-admin' ? 'adminDeleted' : 'userDeleted';
  return {
    [field]: {
      $ne: true
    }
  };
};

Order.relationships = {
  items: {
    ref: 'OrderItem',
    path: 'order',
    private: true
  },
  logs: {
    ref: 'OrderLog',
    path: 'order',
    private: true
  }
};
Order.populations = {
  items: {
    path: 'items'
  }
};
Order.scopes = {
  list: '*'
};
Order.api = {
  list: 3,
  count: 3,
  show: 3,
  create: 3
};
Order.actions = {
  confirm: {
    title: 'Confirm',
    style: 'success',
    sled: 'Confirm',
    depends: {
      state: 300
    }
  },
  ship: {
    title: 'Ship',
    style: 'success',
    sled: 'Ship',
    depends: {
      state: 400
    }
  },
  delete: {
    title: 'Delete',
    style: 'danger',
    confirm: 'Do you confirm the order?',
    sled: 'Delete',
    post: 'js:history.back()'
  }
};
Order.fields = {
  title: {
    label: 'Title',
    type: String,
    required: true
  },
  user: {
    label: 'User',
    type: 'relationship',
    ref: 'alaska-user.User',
    index: true
  },
  type: {
    label: 'Type',
    type: 'select',
    options: []
  },
  pic: {
    label: 'Picture',
    type: 'image'
  },
  items: {
    label: 'Order Items',
    ref: ['OrderItem'],
    noupdate: true
  },
  address: {
    label: 'Address',
    type: Object
  },
  currency: {
    label: 'Currency',
    type: 'select',
    options: _alaskaBalance2.default.getCurrenciesAsync(),
    default: _alaskaBalance2.default.getDefaultCurrencyAsync().then(cur => cur.value)
  },
  shipping: {
    //邮费,不包含在total中,由各个OrderItem.shipping相加
    label: 'Shipping',
    type: Number,
    default: 0
  },
  total: {
    //由各个OrderItem.total相加而得,不包含邮费
    label: 'Total Amount',
    type: Number
  },
  pay: {
    label: 'Pay Amount',
    type: Number
  },
  payed: {
    label: 'Payed Amount',
    type: Number,
    default: 0
  },
  payment: {
    label: 'Payment',
    type: 'select',
    options: [{
      label: 'Balance',
      value: 'balance'
    }]
  },
  refund: {
    label: 'Refunded Amount',
    type: Number,
    depends: 'refund'
  },
  refundReason: {
    label: 'Refund Reason',
    type: String,
    depends: 'refundReason'
  },
  refundAmount: {
    label: 'Refund Amount',
    type: Number,
    depends: 'refundAmount'
  },
  shipped: {
    label: 'Shipped',
    type: Boolean,
    hidden: true
  },
  state: {
    label: 'State',
    type: 'select',
    number: true,
    index: true,
    default: 200,
    options: _2.default.getConfig('status')
  },
  failure: {
    label: 'Failure Reason',
    type: String,
    depends: 'failure'
  },
  createdAt: {
    label: 'Created At',
    type: Date
  },
  paymentTimeout: {
    label: 'Payment Timeout',
    type: Date,
    depends: 'paymentTimeout'
  },
  receiveTimeout: {
    label: 'Receive Timeout',
    type: Date,
    depends: 'receiveTimeout'
  },
  refundTimeout: {
    label: 'Refund Timeout',
    type: Date,
    depends: 'refundTimeout'
  },
  userDeleted: {
    label: 'User Deleted',
    type: Boolean,
    private: true,
    hidden: true
  },
  adminDeleted: {
    label: 'Admin Deleted',
    type: Boolean,
    private: true,
    hidden: true
  }
};