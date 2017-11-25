'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.refreshSettings = exports.applySettings = exports.INITIAL_STATE = exports.REFRESH_SETTINGS = exports.APPLY_SETTINGS = undefined;

var _reduxActions = require('redux-actions');

const APPLY_SETTINGS = exports.APPLY_SETTINGS = 'APPLY_SETTINGS';
const REFRESH_SETTINGS = exports.REFRESH_SETTINGS = 'REFRESH_SETTINGS';

// 初始state
const INITIAL_STATE = exports.INITIAL_STATE = {
  locales: {
    all: {}
  }
};

const applySettings = exports.applySettings = (0, _reduxActions.createAction)(APPLY_SETTINGS);
const refreshSettings = exports.refreshSettings = (0, _reduxActions.createAction)(REFRESH_SETTINGS);

exports.default = (0, _reduxActions.handleActions)({
  APPLY_SETTINGS: (state, action) => action.payload,
  LOGOUT: () => INITIAL_STATE
}, INITIAL_STATE);