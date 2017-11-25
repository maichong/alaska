'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ = require('../');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = async function create(ctx) {
  let user = ctx.user || _2.default.error(403);
  let body = ctx.state.body || ctx.request.body;
  body.user = user;
  let withdraw = await _2.default.run('Withdraw', body);
  ctx.body = withdraw.data('create');
};