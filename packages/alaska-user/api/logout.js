'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ = require('../');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = async function (ctx) {
  await _2.default.run('Logout', { ctx });
  ctx.body = {};
};