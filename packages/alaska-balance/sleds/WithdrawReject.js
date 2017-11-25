'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _User = require('alaska-user/models/User');

var _User2 = _interopRequireDefault(_User);

var _Withdraw = require('../models/Withdraw');

var _Withdraw2 = _interopRequireDefault(_Withdraw);

var _ = require('../');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class WithdrawReject extends _alaska.Sled {
  async exec(params) {
    let withdraw = params.withdraw;
    if (withdraw.state === 0) {
      let reason = params.body.reason || _2.default.error('Missing reject reason');
      withdraw.state = -1;
      if (reason) {
        withdraw.reason = reason;
      }

      await withdraw.save();

      // $Flow
      let user = await _User2.default.findById(withdraw.user);
      if (user) {
        await user._[withdraw.currency].income(withdraw.amount, 'Withdraw Rejected', 'withdraw_rejected');
      }
    } else if (withdraw.state !== -1) {
      _2.default.error('State error');
    }
    return withdraw.toObject();
  }
}
exports.default = WithdrawReject;