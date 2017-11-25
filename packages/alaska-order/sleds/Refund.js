'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _alaska = require('alaska');

var _alaskaSettings = require('alaska-settings');

var _alaskaSettings2 = _interopRequireDefault(_alaskaSettings);

var _ = require('../');

var _2 = _interopRequireDefault(_);

var _Order = require('../models/Order');

var _Order2 = _interopRequireDefault(_Order);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 用户申请退款
 */
class Refund extends _alaska.Sled {
  /**
   * @param params
   *        params.order  {Order}
   *        params.reason string
   *        params.amount number
   */
  async exec(params) {
    let order = params.order;
    if ([400, 500, 800].indexOf(order.state) < 0) _2.default.error('Order state error');
    order.state = 800;

    if (!order.refundTimeout) {
      let refundTimeout = await _alaskaSettings2.default.get('refundTimeout');
      order.refundTimeout = (0, _moment2.default)().add(refundTimeout, 's').toDate();
    }
    order.refundReason = params.reason;
    order.refundAmount = params.amount;
    await order.save();
    order.createLog('Apply refund');
  }
}
exports.default = Refund;