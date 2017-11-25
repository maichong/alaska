'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _Order = require('../models/Order');

var _Order2 = _interopRequireDefault(_Order);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 同意退款请求
 */
class RefundAccept extends _alaska.Sled {
  /**
   * @param params
   *        params.order  {Order}
   */
  async exec(params) {
    let order = params.order;
    order.state = 900;
    // $Flow
    order.refundTimeout = null;
    let currency = order.currency;
    let payed = order.payed;
    //TODO 退款
    await order.save();
    order.createLog('Order refunded');
  }
}
exports.default = RefundAccept;