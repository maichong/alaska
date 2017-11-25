'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _Order = require('../models/Order');

var _Order2 = _interopRequireDefault(_Order);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 退款申请超时,退款应当自动通过
 */
class RefundTimeout extends _alaska.Sled {
  /**
   * @param params
   *        params.order  {Order}
   */
  async exec(params) {
    let order = params.order;
    order.state = 900;
    // $Flow
    order.refundTimeout = null;
    await order.save();
    order.createLog('Order refunded');
  }
}
exports.default = RefundTimeout;