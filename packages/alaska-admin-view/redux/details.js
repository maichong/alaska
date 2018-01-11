'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.INITIAL_STATE = exports.batchApplyDetails = exports.applyDetails = exports.loadDetails = exports.batchClearDetails = exports.clearDetails = exports.BATCH_CLEAR_DETAILS = exports.CLEAR_DETAILS = exports.BATCH_APPLY_DETAILS = exports.APPLY_DETAILS = exports.LOAD_DETAILS = undefined;

var _reduxActions = require('redux-actions');

var _seamlessImmutable = require('seamless-immutable');

var _seamlessImmutable2 = _interopRequireDefault(_seamlessImmutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const LOAD_DETAILS = exports.LOAD_DETAILS = 'LOAD_DETAILS';
const APPLY_DETAILS = exports.APPLY_DETAILS = 'APPLY_DETAILS';
const BATCH_APPLY_DETAILS = exports.BATCH_APPLY_DETAILS = 'BATCH_APPLY_DETAILS';
const CLEAR_DETAILS = exports.CLEAR_DETAILS = 'CLEAR_DETAILS';
const BATCH_CLEAR_DETAILS = exports.BATCH_CLEAR_DETAILS = 'BATCH_CLEAR_DETAILS';

/**
 * 清除详情
 * @param {Object} item
 * @param {string} item.key
 * @param {string[]} [item.ids]
 */
const clearDetails = exports.clearDetails = (0, _reduxActions.createAction)(CLEAR_DETAILS);

/**
 * 批量清除详情
 * @param {Array<{key:string, ids:string[]}>} list
 */
const batchClearDetails = exports.batchClearDetails = (0, _reduxActions.createAction)(BATCH_CLEAR_DETAILS);

/**
 * 加载详情
 * @param {Object} item
 * @param {string} item.service
 * @param {string} item.model
 * @param {string} item.key
 * @param {string} item.id
 */
const loadDetails = exports.loadDetails = (0, _reduxActions.createAction)(LOAD_DETAILS);

/**
 * 成功获得详情数据
 * @param {string} key
 * @param {Object} data
 */
const applyDetails = exports.applyDetails = (0, _reduxActions.createAction)(APPLY_DETAILS, (key, data) => ({ key, data }));

/**
 * 批量更新详情数据
 * @param {Array<{key:string, data:Object}>} list
 */
const batchApplyDetails = exports.batchApplyDetails = (0, _reduxActions.createAction)(BATCH_APPLY_DETAILS);

// 初始state
const INITIAL_STATE = exports.INITIAL_STATE = (0, _seamlessImmutable2.default)({});

exports.default = (0, _reduxActions.handleActions)({
  CLEAR_DETAILS: (state, { payload }) => {
    let { key, ids } = payload;
    if (!ids) {
      return state.without(key);
    }
    let list = state[key];
    if (!list) return state;
    list = list.without(ids);
    return state.set(key, list);
  },
  BATCH_CLEAR_DETAILS: (state, { payload }) => {
    payload.forEach(({ key, ids }) => {
      if (ids) {
        let list = state[key];
        if (list) {
          list = list.without(ids);
          state = state.set(key, list);
        }
      } else {
        state = state.without(key);
      }
    });
    return state;
  },
  APPLY_DETAILS: (state, { payload }) => {
    let { key, data } = payload;
    let datas = state[key] || (0, _seamlessImmutable2.default)({});
    datas = datas.set(data._id, data);
    return state.set(key, datas);
  },
  BATCH_APPLY_DETAILS: (state, { payload }) => {
    for (let _ref of payload) {
      let { key, data } = _ref;

      let datas = state[key] || (0, _seamlessImmutable2.default)({});
      datas = datas.set(data._id, data);
      state = state.set(key, datas);
    }
    return state;
  },
  LOGOUT: () => INITIAL_STATE
}, INITIAL_STATE);