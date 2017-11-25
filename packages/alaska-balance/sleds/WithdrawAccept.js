'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _Withdraw = require('../models/Withdraw');

var _Withdraw2 = _interopRequireDefault(_Withdraw);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class WithdrawAccept extends _alaska.Sled {
  async exec(params) {
    let withdraw = params.withdraw;
    if (withdraw.state === 0) {
      withdraw.state = 1;
      await withdraw.save();
    }
    return withdraw.toObject();
  }
}
exports.default = WithdrawAccept;