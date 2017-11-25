'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.applyLayout = exports.APPLY_LAYOUT = undefined;

var _reduxActions = require('redux-actions');

const APPLY_LAYOUT = exports.APPLY_LAYOUT = 'APPLY_LAYOUT';

const applyLayout = exports.applyLayout = (0, _reduxActions.createAction)(APPLY_LAYOUT);

exports.default = (0, _reduxActions.handleActions)({
  APPLY_LAYOUT: (state, action) => {
    if (window.localStorage) {
      window.localStorage.setItem('layout', action.payload);
    }
    return action.payload;
  }
}, (window.localStorage ? window.localStorage.getItem('layout') : '') || 'full');