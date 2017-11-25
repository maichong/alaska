'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fields = undefined;

exports.default = function (Payment) {
  if (_lodash2.default.find(Payment.fields.type.options, opt => opt.value === 'alipay')) return;
  Payment.fields.type.options.push({ label: 'Alipay', value: 'alipay' });
};

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const fields = exports.fields = {
  alipay_trade_no: {
    label: 'Alipay Trade No',
    type: String,
    private: true
  },
  alipay_buyer_email: {
    label: 'Alipay Buyer Email',
    type: String,
    private: true
  }
};