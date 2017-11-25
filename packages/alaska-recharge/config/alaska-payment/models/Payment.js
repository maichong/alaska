'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fields = undefined;

var _alaskaRecharge = require('alaska-recharge');

var _alaskaRecharge2 = _interopRequireDefault(_alaskaRecharge);

var _Recharge = require('alaska-recharge/models/Recharge');

var _Recharge2 = _interopRequireDefault(_Recharge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// fix bug
_Recharge2.default.service = _alaskaRecharge2.default;

const fields = exports.fields = {
  recharge: {
    label: 'Recharge Record',
    ref: _Recharge2.default,
    private: true
  }
};