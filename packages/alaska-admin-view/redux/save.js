'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.INITIAL_STATE = exports.saveFailure = exports.saveSuccess = exports.save = exports.SAVE_FAILURE = exports.SAVE_SUCCESS = exports.SAVE = undefined;

var _reduxActions = require('redux-actions');

var _seamlessImmutable = require('seamless-immutable');

var _seamlessImmutable2 = _interopRequireDefault(_seamlessImmutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const SAVE = exports.SAVE = 'SAVE';
const SAVE_SUCCESS = exports.SAVE_SUCCESS = 'SAVE_SUCCESS';
const SAVE_FAILURE = exports.SAVE_FAILURE = 'SAVE_FAILURE';

/**
 * @param {Object} options
 * @param {string} options.key
 * @param {string} options.service
 * @param {string} options.model
 * @param {number} options._r
 * @param {Object} data
 */
const save = exports.save = (0, _reduxActions.createAction)(SAVE, (options, data) => Object.assign({ data }, options));

/**
 * @param {Object} options
 * @param {string} options.key
 * @param {string} options.service
 * @param {string} options.model
 * @param {number} options._r
 * @param {Object} res
 */
const saveSuccess = exports.saveSuccess = (0, _reduxActions.createAction)(SAVE_SUCCESS, (options, res) => Object.assign({ res }, options));

/**
 * @param {Object} options
 * @param {string} options.key
 * @param {string} options.service
 * @param {string} options.model
 * @param {number} options._r
 * @param {Error} error
 */
const saveFailure = exports.saveFailure = (0, _reduxActions.createAction)(SAVE_FAILURE, (options, error) => Object.assign({ error }, options));

// 初始state
const INITIAL_STATE = exports.INITIAL_STATE = (0, _seamlessImmutable2.default)({
  error: null,
  fetching: false,
  key: '',
  _r: 0,
  res: {}
});

exports.default = (0, _reduxActions.handleActions)({
  SAVE: (state, { payload }) => state.merge({
    error: null, fetching: true, key: payload.key, _r: payload._r, res: {}
  }),
  SAVE_SUCCESS: (state, { payload }) => state.merge({
    error: null,
    fetching: false,
    key: payload.key,
    _r: payload._r,
    res: payload.res
  }),
  SAVE_FAILURE: (state, { payload }) => state.merge({
    error: { message: payload.error.message, code: payload.error.code },
    fetching: false,
    key: payload.key,
    _r: payload._r,
    res: {}
  }),
  LOGOUT: () => INITIAL_STATE
}, INITIAL_STATE);