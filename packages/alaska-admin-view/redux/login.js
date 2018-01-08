'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.INITIAL_STATE = exports.logout = exports.loginFailure = exports.loginSuccess = exports.login = exports.LOGIN_SUCCESS = exports.LOGIN_FAILURE = exports.LOGOUT = exports.LOGIN = undefined;

var _reduxActions = require('redux-actions');

var _seamlessImmutable = require('seamless-immutable');

var _seamlessImmutable2 = _interopRequireDefault(_seamlessImmutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const LOGIN = exports.LOGIN = 'LOGIN';
const LOGOUT = exports.LOGOUT = 'LOGOUT';
const LOGIN_FAILURE = exports.LOGIN_FAILURE = 'LOGIN_FAILURE';
const LOGIN_SUCCESS = exports.LOGIN_SUCCESS = 'LOGIN_SUCCESS';

/**
 * 请求登录 action
 * @params {string} username
 * @params {string} password
 */
const login = exports.login = (0, _reduxActions.createAction)(LOGIN, (username, password) => ({ username, password }));

/**
 * 登录成功 action
 */
const loginSuccess = exports.loginSuccess = (0, _reduxActions.createAction)(LOGIN_SUCCESS);

/**
 * 登录失败
 * @params {Error} error
 */
const loginFailure = exports.loginFailure = (0, _reduxActions.createAction)(LOGIN_FAILURE);

/**
 * 退出登录 action
 */
const logout = exports.logout = (0, _reduxActions.createAction)(LOGOUT);

// 初始state
const INITIAL_STATE = exports.INITIAL_STATE = (0, _seamlessImmutable2.default)({
  show: true,
  errorMsg: ''
});

exports.default = (0, _reduxActions.handleActions)({
  LOGIN: state => state.set('errorMsg', ''),
  LOGIN_FAILURE: (state, { payload }) => state.merge({ errorMsg: payload.message }),
  LOGOUT_SUCCESS: () => INITIAL_STATE,
  LOGIN_SUCCESS: state => state.merge({ user: false, errorMsg: '' }),
  LOGOUT: () => INITIAL_STATE
}, INITIAL_STATE);