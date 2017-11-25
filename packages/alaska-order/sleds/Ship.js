'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _alaska = require('alaska');

var _alaskaSettings = require('alaska-settings');

var _alaskaSettings2 = _interopRequireDefault(_alaskaSettings);

var _Order = require('../models/Order');

var _Order2 = _interopRequireDefault(_Order);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 发货操作
 */
class Ship extends _alaska.Sled {
  /**
   * @param params
   *        params.order  {Order}
   */
  async exec(params) {
    let order = params.order;
    if (order.state === 400) {
      order.state = 500;
    }
    if (order.state === 500 && !order.receiveTimeout) {
      let receiveTimeout = await _alaskaSettings2.default.get('receiveTimeout');
      order.receiveTimeout = (0, _moment2.default)().add(receiveTimeout, 's').toDate();
    }
    order.shipped = true;
    await order.save();
    order.createLog('Order shipped');
  }
}
exports.default = Ship;