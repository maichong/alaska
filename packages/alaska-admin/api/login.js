'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.login = login;
exports.logout = logout;

var _alaskaUser = require('alaska-user');

var _alaskaUser2 = _interopRequireDefault(_alaskaUser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function login(ctx) {
  let username = ctx.request.body.username || ctx.error('Username is required');
  let password = ctx.request.body.password || ctx.error('Password is required');
  let user = await _alaskaUser2.default.run('Login', { ctx, username, password });
  let access = await user.hasAbility('admin');
  ctx.body = Object.assign({ access }, user.data());
}

async function logout(ctx) {
  await _alaskaUser2.default.run('Logout', { ctx });
  ctx.body = {};
}