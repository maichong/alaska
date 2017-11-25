'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.login = login;
exports.logout = logout;

var _effects = require('redux-saga/effects');

var _akita = require('akita');

var _akita2 = _interopRequireDefault(_akita);

var _login = require('../redux/login');

var _settings = require('../redux/settings');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// 登录请求 /api/login/login
function* login({ payload }) {
  try {
    yield _akita2.default.post('/api/login/login', { body: payload });
    yield (0, _effects.put)((0, _login.loginSuccess)());
    yield (0, _effects.put)((0, _settings.refreshSettings)());
  } catch (e) {
    console.error(e);
    yield (0, _effects.put)((0, _login.loginFailure)(e));
  }
}

function* logout() {
  try {
    yield _akita2.default.post('/api/login/logout');
    yield (0, _effects.put)((0, _settings.refreshSettings)());
  } catch (e) {
    console.error(e);
  }
}