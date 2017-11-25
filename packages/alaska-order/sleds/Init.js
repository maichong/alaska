'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _alaskaSettings = require('alaska-settings');

var _alaskaSettings2 = _interopRequireDefault(_alaskaSettings);

var _ = require('../');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Init extends _alaska.Sled {
  exec() {
    _alaskaSettings2.default.register({
      id: 'order.paymentTimeout',
      title: 'Payment Timeout',
      service: _2.default.id,
      group: 'Order',
      type: 'NumberFieldView',
      value: 3600,
      options: {
        addonAfter: 'Second'
      }
    });
    _alaskaSettings2.default.register({
      id: 'order.receiveTimeout',
      title: 'Receive Timeout',
      service: _2.default.id,
      group: 'Order',
      type: 'NumberFieldView',
      value: 86400 * 10,
      options: {
        addonAfter: 'Second'
      }
    });
    _alaskaSettings2.default.register({
      id: 'order.refundTimeout',
      title: 'Refund Timeout',
      service: _2.default.id,
      group: 'Order',
      type: 'NumberFieldView',
      value: 86400 * 2,
      options: {
        addonAfter: 'Second'
      }
    });
  }
}
exports.default = Init;