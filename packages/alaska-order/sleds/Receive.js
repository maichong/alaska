'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _Order = require('../models/Order');

var _Order2 = _interopRequireDefault(_Order);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Receive extends _alaska.Sled {
  /**
   * @param params
   *        params.order  {Order}
   */
  async exec(params) {
    let order = params.order;
    if (order.state === 500) {
      order.state = 600;
    }
    // $Flow
    order.receiveTimeout = null;
    await order.save();
    order.createLog('Order received');
  }
}
exports.default = Receive;