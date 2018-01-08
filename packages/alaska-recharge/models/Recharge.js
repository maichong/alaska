'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _alaskaBalance = require('alaska-balance');

var _alaskaBalance2 = _interopRequireDefault(_alaskaBalance);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// @Flow

class Recharge extends _alaska.Model {

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
exports.default = Recharge;
Recharge.label = 'Recharge';
Recharge.icon = 'paypal';
Recharge.titleField = 'title';
Recharge.defaultColumns = 'title user target deposit currency amount type state createdAt';
Recharge.defaultSort = '-createdAt';
Recharge.actions = {
  complete: {
    title: 'Complete',
    sled: 'Complete',
    style: 'warning',
    confirm: 'COMPLETE_RECHARGE_WARING',
    depends: {
      _id: {
        $gt: ''
      },
      type: 'manual',
      state: 0
    }
  }
};
Recharge.fields = {
  title: {
    label: 'Title',
    type: String,
    required: true,
    private: true
  },
  user: {
    label: 'User',
    ref: 'alaska-user.User',
    private: true
  },
  target: {
    label: 'Target',
    type: 'select',
    default: 'balance',
    checkbox: true,
    options: [{
      label: 'Balance',
      value: 'balance'
    }, {
      label: 'Deposit',
      value: 'deposit'
    }]
  },
  currency: {
    label: 'Currency',
    type: 'select',
    checkbox: true,
    options: _alaskaBalance2.default.getCurrenciesAsync(),
    default: _alaskaBalance2.default.getDefaultCurrencyAsync().then(cur => cur.value)
  },
  deposit: {
    label: 'Deposit',
    ref: 'alaska-balance.Deposit',
    depends: {
      target: 'deposit'
    },
    filters: {
      user: ':user' // 只显示当前用户Deposit列表
    }
  },
  amount: {
    label: 'Amount',
    type: Number,
    required: true,
    private: true
  },
  type: {
    label: 'Payment Type',
    type: 'select',
    checkbox: true,
    default: 'manual',
    options: [{
      label: 'Manual',
      value: 'manual'
    }],
    required: true
  },
  payment: {
    label: 'Payment Logs',
    ref: 'alaska-payment.Payment',
    disabled: true
  },
  state: {
    label: 'State',
    type: 'select',
    number: true,
    switch: true,
    default: 0,
    options: [{
      label: 'Pending',
      value: 0,
      style: 'info'
    }, {
      label: 'Success',
      value: 1,
      style: 'success'
    }, {
      label: 'Failed',
      value: -1,
      style: 'danger'
    }]
  },
  createdAt: {
    label: 'Created At',
    type: Date
  }
};