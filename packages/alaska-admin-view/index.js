// @flow

import { details } from './redux/details';
import { layout } from './redux/layout';
import { list } from './redux/lists';
import { login, logout } from './redux/login';
import { save, remove } from './redux/save';
import { refreshInfo } from './redux/user';

import store from './redux/index';

exports.store = store;
exports.actions = {
  details, layout, list, login, logout, save, remove, refreshInfo
};
exports.App = require('./views/App').default;
exports.shallowEqual = require('./utils/shallow-equal').default;
exports.checkDepends = require('./utils/check-depends').default;
