'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.applyUser = exports.INITIAL_STATE = exports.APPLY_USER = undefined;

var _reduxActions = require('redux-actions');

var _seamlessImmutable = require('seamless-immutable');

var _seamlessImmutable2 = _interopRequireDefault(_seamlessImmutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const APPLY_USER = exports.APPLY_USER = 'APPLY_USER';

// 初始state
const INITIAL_STATE = exports.INITIAL_STATE = (0, _seamlessImmutable2.default)({});

/**
 * 更新用户信息
 * @params {Object} user
 */
const applyUser = exports.applyUser = (0, _reduxActions.createAction)(APPLY_USER);

exports.default = (0, _reduxActions.handleActions)({
  APPLY_USER: (state, action) => state.merge(action.payload),
  LOGOUT: () => INITIAL_STATE
}, INITIAL_STATE);