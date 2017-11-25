'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = root;

var _effects = require('redux-saga/effects');

var _startup = require('../redux/startup');

var _settings = require('../redux/settings');

var _login = require('../redux/login');

var _details = require('../redux/details');

var _lists = require('../redux/lists');

var _save = require('../redux/save');

var _details2 = require('./details');

var _details3 = _interopRequireDefault(_details2);

var _list = require('./list');

var _list2 = _interopRequireDefault(_list);

var _settings2 = require('./settings');

var _settings3 = _interopRequireDefault(_settings2);

var _login2 = require('./login');

var _save2 = require('./save');

var _save3 = _interopRequireDefault(_save2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// 当action触发时，执行特定saga
function* root() {
  yield [(0, _effects.takeLatest)(_startup.STARTUP, _settings3.default), (0, _effects.takeLatest)(_settings.REFRESH_SETTINGS, _settings3.default), (0, _effects.takeLatest)(_login.LOGIN, _login2.login), (0, _effects.takeLatest)(_login.LOGOUT, _login2.logout), (0, _effects.takeEvery)(_details.LOAD_DETAILS, _details3.default), (0, _effects.takeLatest)(_lists.LOAD_LIST, _list2.default), (0, _effects.takeEvery)(_save.SAVE, _save3.default)];
}