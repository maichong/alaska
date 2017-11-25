'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _alaska2 = _interopRequireDefault(_alaska);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Create extends _alaska.Sled {
  async exec(params) {
    let payment = params.payment;
    if (!payment) {
      //前置钩子未生成任何支付记录
      _alaska2.default.error('Can not create any payment');
    }
    return payment;
  }
}
exports.default = Create;