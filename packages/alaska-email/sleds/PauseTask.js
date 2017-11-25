'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _ = require('../');

var _2 = _interopRequireDefault(_);

var _EmailTask = require('../models/EmailTask');

var _EmailTask2 = _interopRequireDefault(_EmailTask);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class PauseTask extends _alaska.Sled {
  async exec(params) {
    let task = params.emailTask;

    if (task.state !== 1) {
      _2.default.error('Error state');
    }

    task.state = 2;

    await task.save();

    return task.toObject();
  }
}
exports.default = PauseTask;