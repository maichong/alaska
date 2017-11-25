'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _User = require('alaska-user/models/User');

var _User2 = _interopRequireDefault(_User);

var _ = require('../');

var _2 = _interopRequireDefault(_);

var _Email = require('../models/Email');

var _Email2 = _interopRequireDefault(_Email);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class EmailTask extends _alaska.Model {

  async preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    if (!this.state && !this.nextAt) {
      this.nextAt = new Date();
    }
    if (!this.total && !this.state) {
      this.total = await _User2.default.where(this._.filters.filter() || {}).where('email').ne(null).count();
    }
  }

  postSave() {
    _2.default.updateTasks();
  }

  postRemove() {
    _2.default.updateTasks();
  }
}
exports.default = EmailTask;
EmailTask.label = 'Email Task';
EmailTask.icon = 'paper-plane';
EmailTask.titleField = 'title';
EmailTask.defaultColumns = 'title email state progress total createdAt';
EmailTask.defaultSort = '-sort';
EmailTask.actions = {
  run: {
    title: 'Run',
    style: 'success',
    sled: 'RunTask',
    depends: {
      state: 0
    }
  },
  resume: {
    title: 'Resume',
    style: 'success',
    sled: 'ResumeTask',
    depends: {
      state: 2
    }
  },
  pause: {
    title: 'Pause',
    style: 'warning',
    sled: 'PauseTask',
    depends: {
      state: 1
    }
  }
};
EmailTask.fields = {
  title: {
    label: 'Title',
    type: String,
    required: true
  },
  email: {
    label: 'Email',
    ref: 'Email',
    required: true
  },
  state: {
    label: 'State',
    type: 'select',
    number: true,
    default: 0,
    options: [{
      label: 'Ready',
      value: 0
    }, {
      label: 'Running',
      value: 1
    }, {
      label: 'Pause',
      value: 2
    }, {
      label: 'Complete',
      value: 3
    }]
  },
  interval: {
    label: 'Interval',
    type: Number,
    default: 1,
    addonAfter: 'Seconds'
  },
  filters: {
    label: 'Filters',
    type: 'filter',
    ref: 'alaska-user.User'
  },
  progress: {
    label: 'Progress',
    type: Number,
    default: 0
  },
  total: {
    label: 'Total',
    type: Number
  },
  lastUser: {
    label: 'Last User',
    ref: _User2.default
  },
  nextAt: {
    label: 'Next At',
    type: Date
  },
  createdAt: {
    label: 'Created At',
    type: Date
  }
};