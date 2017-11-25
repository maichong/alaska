'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

class Log extends _alaska.Model {

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
exports.default = Log;
Log.label = 'Log';
Log.icon = 'file-text-o';
Log.titleField = 'title';
Log.defaultColumns = '_id type level method title status time length createdAt';
Log.defaultSort = '-_id';
Log.fields = {
  title: {
    label: 'Title',
    type: String,
    required: true
  },
  type: {
    label: 'Type',
    type: String
  },
  level: {
    label: 'Level',
    type: 'select',
    options: [{
      label: 'Debug',
      value: 'debug'
    }, {
      label: 'Info',
      value: 'info'
    }, {
      label: 'Warning',
      value: 'warning'
    }, {
      label: 'Error',
      value: 'error'
    }, {
      label: 'Fatal',
      value: 'fatal'
    }]
  },
  method: {
    label: 'Method',
    type: String
  },
  time: {
    label: 'Time',
    type: Number,
    format: '0,0',
    addonAfter: 'milliseconds'
  },
  status: {
    label: 'Status',
    type: String
  },
  length: {
    label: 'Length',
    type: 'bytes',
    size: 1024
  },
  details: {
    label: 'Details',
    type: Object
  },
  createdAt: {
    label: 'Created At',
    type: Date
  }
};