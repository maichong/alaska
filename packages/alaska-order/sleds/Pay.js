'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _Order = require('../models/Order');

var _Order2 = _interopRequireDefault(_Order);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 支付订单
 */
class Pay extends _alaska.Sled {
  /**
   * @param params
   *        params.order  {Order}
   */
  async exec(params) {
    let order = params.order;
    if (order.state === 200) {
      order.state = 300;
    }
    // $Flow
    order.paymentTimeout = null;
    await order.save();
    order.createLog('Order payed');
  }
}
exports.default = Pay;