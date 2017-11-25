'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _ = require('../');

var _2 = _interopRequireDefault(_);

var _Order = require('../models/Order');

var _Order2 = _interopRequireDefault(_Order);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class OrderLog extends _alaska.Model {

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
exports.default = OrderLog;
OrderLog.label = 'Order Log';
OrderLog.icon = 'hourglass-2';
OrderLog.defaultColumns = 'title order createdAt';
OrderLog.defaultSort = '-createdAt';
OrderLog.nocreate = true;
OrderLog.noupdate = true;
OrderLog.noremove = true;
OrderLog.fields = {
  title: {
    label: 'Title',
    type: String,
    required: true,
    translate: true
  },
  order: {
    label: 'Order',
    type: 'relationship',
    ref: 'Order',
    index: true
  },
  state: {
    label: 'State',
    type: 'select',
    number: true,
    options: _2.default.getConfig('status')
  },
  createdAt: {
    label: '添加时间',
    type: Date
  }
};