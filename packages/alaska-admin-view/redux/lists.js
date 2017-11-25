'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.INITIAL_STATE = exports.loadListFailure = exports.applyList = exports.loadList = exports.clearList = exports.LOAD_LIST_FAILURE = exports.APPLY_LIST = exports.LOAD_LIST = exports.CLEAR_LIST = undefined;

var _reduxActions = require('redux-actions');

var _seamlessImmutable = require('seamless-immutable');

var _seamlessImmutable2 = _interopRequireDefault(_seamlessImmutable);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const CLEAR_LIST = exports.CLEAR_LIST = 'CLEAR_LIST';
const LOAD_LIST = exports.LOAD_LIST = 'LOAD_LIST';
const APPLY_LIST = exports.APPLY_LIST = 'APPLY_LIST';
const LOAD_LIST_FAILURE = exports.LOAD_LIST_FAILURE = 'LOAD_LIST_FAILURE';

/**
 * 清空列表 action
 * @params {string} key 要清空的列表key，空代表清空全部
 */
const clearList = exports.clearList = (0, _reduxActions.createAction)(CLEAR_LIST, key => ({ key }));

/**
 * 加载列表
 * @param {Object} options
 * @param {string} options.service
 * @param {string} options.model
 * @param {string} options.key
 * @param {number} options.page
 * @param {Object} options.filters
 * @param {string} options.search
 * @param {string} options.sort
 */
const loadList = exports.loadList = (0, _reduxActions.createAction)(LOAD_LIST);
/**
 * 加载成功
 * @param {string} key
 * @param {Object} res
 */
const applyList = exports.applyList = (0, _reduxActions.createAction)(APPLY_LIST, (key, res) => Object.assign({ key }, res));
/**
 * 加载失败
 * @param {string} key
 * @param {Error} error
 */
const loadListFailure = exports.loadListFailure = (0, _reduxActions.createAction)(LOAD_LIST_FAILURE, (key, error) => ({ key, error }));

// 初始state
const INITIAL_STATE = exports.INITIAL_STATE = (0, _seamlessImmutable2.default)({});

exports.default = (0, _reduxActions.handleActions)({
  CLEAR_LIST: (state, { payload }) => payload.key ? state.without(payload.key) : INITIAL_STATE,
  APPLY_LIST: (state, { payload }) => {
    let key = payload.key;
    let info = _lodash2.default.omit(payload, 'results');
    let list = state[payload.key] || (0, _seamlessImmutable2.default)({});

    list = list.merge(info);
    list = list.set('error', '');

    if (payload.page === 1) {
      list = list.set('results', payload.results);
    } else {
      let results = list.results || (0, _seamlessImmutable2.default)([]);
      list = list.set('results', results.concat(payload.results));
    }
    return state.set(key, list);
  },
  LOAD_LIST_FAILURE: (state, { payload }) => {
    let list = state[payload.key] || (0, _seamlessImmutable2.default)({});
    return state.set(payload.key, list.set('error', payload.error.message));
  },
  LOGOUT: () => INITIAL_STATE
}, INITIAL_STATE);