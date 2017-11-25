'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.relationships = undefined;

var _Income = require('../../../models/Income');

var _Income2 = _interopRequireDefault(_Income);

var _Deposit = require('../../../models/Deposit');

var _Deposit2 = _interopRequireDefault(_Deposit);

var _Withdraw = require('../../../models/Withdraw');

var _Withdraw2 = _interopRequireDefault(_Withdraw);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const relationships = exports.relationships = {
  incomes: {
    ref: _Income2.default,
    path: 'user',
    private: true
  },
  deposits: {
    ref: _Deposit2.default,
    path: 'user',
    private: true
  },
  withdraw: {
    ref: _Withdraw2.default,
    path: 'user',
    private: true
  }
};