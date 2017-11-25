'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fields = undefined;

exports.default = function (Payment) {
  if (_lodash2.default.find(Payment.fields.type.options, opt => opt.value === 'balance')) return;
  Payment.fields.type.options.push({ label: 'Balance', value: 'balance' });
};

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _alaskaBalance = require('alaska-balance');

var _alaskaBalance2 = _interopRequireDefault(_alaskaBalance);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const fields = exports.fields = {
  currency: {
    label: 'Currency',
    type: 'select',
    options: _alaskaBalance2.default.getCurrenciesAsync(),
    default: _alaskaBalance2.default.getDefaultCurrencyAsync().then(cur => cur.value)
  }
};