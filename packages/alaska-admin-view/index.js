'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.api = exports.App = exports.store = undefined;

var _akita = require('akita');

var _akita2 = _interopRequireDefault(_akita);

var _index = require('./redux/index');

var _index2 = _interopRequireDefault(_index);

var _App = require('./views/App');

var _App2 = _interopRequireDefault(_App);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_akita2.default.setOptions({
  apiRoot: window.PREFIX,
  init: {
    credentials: 'include'
  }
});

exports.store = _index2.default;
exports.App = _App2.default;
exports.api = _akita2.default;