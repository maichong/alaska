'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _Order = require('../models/Order');

var _Order2 = _interopRequireDefault(_Order);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Reject extends _alaska.Sled {
  /**
   * @param params
   *        params.order  {Order}
   */
  async exec(params) {
    let order = params.order;
    if (order.state === 300) {
      order.state = 900;
    }
    if (!order.failure) {
      order.failure = 'Rejected';
    }
    await order.save();
    order.createLog('Order rejected');
  }
}
exports.default = Reject;