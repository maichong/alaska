'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fields = undefined;

var _Shop = require('../../../models/Shop');

var _Shop2 = _interopRequireDefault(_Shop);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const fields = exports.fields = {
  shop: {
    label: 'Shop',
    ref: _Shop2.default,
    index: true
  }
};