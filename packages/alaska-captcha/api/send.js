'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ = require('../');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = async function (ctx) {
  if (ctx.method !== 'POST') _2.default.error(400);
  let body = ctx.state.body || ctx.request.body;
  let id = body.id || ctx.request.body.id;
  let to = body.to || ctx.request.body.to;
  await _2.default.run('Send', { ctx, id, to });
  ctx.body = {};
};