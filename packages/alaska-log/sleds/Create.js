'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _Log = require('../models/Log');

var _Log2 = _interopRequireDefault(_Log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Create extends _alaska.Sled {
  async exec(params) {
    let log = new _Log2.default(params);
    await log.save();
    return log;
  }
}
exports.default = Create;