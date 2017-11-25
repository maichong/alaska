'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startup = exports.STARTUP = undefined;

var _reduxActions = require('redux-actions');

const STARTUP = exports.STARTUP = 'STARTUP';

const startup = exports.startup = (0, _reduxActions.createAction)(STARTUP);