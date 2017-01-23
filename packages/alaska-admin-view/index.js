// @flow

import '../less/style.less';

import store from './redux/index';

exports.store = store;
exports.App = require('./views/App').default;
exports.api = require('./utils/api').default;
exports.shallowEqual = require('./utils/shallow-equal').default;
exports.checkDepends = require('./utils/check-depends').default;
exports.actions = require('./actions');
