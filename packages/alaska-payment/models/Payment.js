'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

class Payment extends _alaska.Model {

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
exports.default = Payment;
Payment.label = 'Payment Logs';
Payment.icon = 'money';
Payment.defaultColumns = 'title user type amount state createdAt';
Payment.defaultSort = '-createdAt';
Payment.nocreate = true;
Payment.noupdate = true;
Payment.api = {
  create: 3,
  show: 3
};
Payment.actions = {
  complete: {
    title: 'Complete',
    sled: 'Complete',
    style: 'warning',
    confirm: 'COMPLETE_PAYMENT_WARING',
    depends: {
      state: 0
    }
  }
};
Payment.fields = {
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
  amount: {
    label: 'Amount',
    type: Number,
    required: true,
    private: true
  },
  type: {
    label: 'Payment Type',
    type: 'select',
    options: [],
    required: true
  },
  params: {
    label: 'Params',
    type: Object,
    required: true
  },
  state: {
    label: 'State',
    type: 'select',
    number: true,
    default: 0,
    options: [{
      label: 'Pending',
      value: 0
    }, {
      label: 'Success',
      value: 1
    }, {
      label: 'Failed',
      value: -1
    }]
  },
  failure: {
    label: 'Failure Reason',
    type: String
  },
  createdAt: {
    label: 'Created At',
    type: Date
  }
};