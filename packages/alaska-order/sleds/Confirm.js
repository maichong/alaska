'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _Order = require('../models/Order');

var _Order2 = _interopRequireDefault(_Order);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 审核订单
 */
class Confirm extends _alaska.Sled {
  /**
   * @param params
   *        params.order  {Order}
   */
  async exec(params) {
    let order = params.order;
    if (order.state === 300) {
      order.state = 400;
    }
    await order.save();
    order.createLog('Order confirmed');
  }
}
exports.default = Confirm;