'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _Order = require('../models/Order');

var _Order2 = _interopRequireDefault(_Order);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Delete extends _alaska.Sled {
  /**
   * @param params
   *        params.order  {Order}
   *        [params.ctx]
   *        [params.admin]
   */
  async exec(params) {
    let order = params.order;
    if (params.admin) {
      order.adminDeleted = true;
      await order.save();
    } else {
      order.userDeleted = true;
      await order.save();
      order.createLog('Deleted');
    }
  }
}
exports.default = Delete;