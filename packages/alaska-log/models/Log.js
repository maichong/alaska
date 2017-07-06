// @flow

import { Model } from 'alaska';

export default class Log extends Model {
  static label = 'Log';
  static icon = 'file-text-o';
  static titleField = 'title';
  static defaultColumns = '_id type level method title status time length createdAt';
  static defaultSort = '-_id';

  static fields = {
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

  title: string;
  type: string;
  level: string;
  method: string;
  time: number;
  status: string;
  length: number;
  details: Object;
  createdAt: Date;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
