'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _ = require('../');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Test extends _alaska.Sled {
  async exec(params) {
    let email = params.email;
    await _2.default.run('Send', {
      email,
      to: params.body.testTo,
      values: params.body.testData
    });
    return email.toObject();
  }
}
exports.default = Test;