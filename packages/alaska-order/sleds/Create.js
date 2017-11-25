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
 * 下单Sled
 */
class Create extends _alaska.Sled {
  /**
   * @param params 订单数据对象
   *        params.pre    {boolean}
   *        params.user   {User} 用户
   *        params.orders {[Order]} 前置钩子生成的订单
   */
  async exec(params) {
    let orders = params.orders;
    if (!orders || !orders.length) {
      //前置钩子未生成任何订单
      _2.default.error('Can not create any order');
    }
    if (!params.pre) {
      let paymentTimeout = await _alaskaSettings2.default.get('paymentTimeout');
      for (let order of orders) {
        for (let item of order.items) {
          await item.save();
        }
        if (paymentTimeout && order.state === 200 && !order.paymentTimeout) {
          order.paymentTimeout = (0, _moment2.default)().add(paymentTimeout, 's').toDate();
        }
        await order.save();
        order.createLog('Order created');
      }
    }
    return params;
  }
}
exports.default = Create;