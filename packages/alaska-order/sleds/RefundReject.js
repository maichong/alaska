'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _Order = require('../models/Order');

var _Order2 = _interopRequireDefault(_Order);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 退款审核拒绝
 */
class RefundReject extends _alaska.Sled {
  /**
   * @param params
   *        params.order  {Order}
   */
  async exec(params) {
    let order = params.order;
    if (order.shipped) {
      order.state = 500;
    } else {
      order.state = 400;
    }
    // $Flow
    order.refundTimeout = null;
    await order.save();
    order.createLog('Refund rejected');
  }
}
exports.default = RefundReject;