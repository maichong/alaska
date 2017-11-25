'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ = require('../');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = async function (ctx) {
  if (ctx.method !== 'POST') ctx.error(400);

  let { username, password } = ctx.request.body;

  if (!username) ctx.error('Username is required');

  if (!password) ctx.error('Password is required');

  let user = await _2.default.run('Login', { ctx, username, password });
  ctx.body = user.data('info');
};