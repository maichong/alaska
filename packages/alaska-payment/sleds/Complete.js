'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _alaska2 = _interopRequireDefault(_alaska);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Complete extends _alaska.Sled {
  /**
   * @param data
   *        data.payment
   */
  async exec(params) {
    if (!params.done) _alaska2.default.error('No valid payment complete hooks');
    let payment = params.payment;
    payment.state = 1;
    await payment.save();
    return payment.toObject();
  }
}
exports.default = Complete;