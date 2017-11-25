'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _redux = require('redux');

var _configureStore = require('./configureStore');

var _configureStore2 = _interopRequireDefault(_configureStore);

var _sagas = require('../sagas/');

var _sagas2 = _interopRequireDefault(_sagas);

var _details = require('./details');

var _details2 = _interopRequireDefault(_details);

var _layout = require('./layout');

var _layout2 = _interopRequireDefault(_layout);

var _lists = require('./lists');

var _lists2 = _interopRequireDefault(_lists);

var _login = require('./login');

var _login2 = _interopRequireDefault(_login);

var _save = require('./save');

var _save2 = _interopRequireDefault(_save);

var _settings = require('./settings');

var _settings2 = _interopRequireDefault(_settings);

var _user = require('./user');

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createStore() {
  const rootReducer = (0, _redux.combineReducers)({
    login: _login2.default,
    user: _user2.default,
    settings: _settings2.default,
    lists: _lists2.default,
    details: _details2.default,
    layout: _layout2.default,
    save: _save2.default
  });

  return (0, _configureStore2.default)(rootReducer, _sagas2.default);
}

const store = createStore();
window.store = store;
exports.default = store;