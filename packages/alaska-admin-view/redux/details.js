'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.INITIAL_STATE = exports.applyBatchDetails = exports.applyDetails = exports.loadDetails = exports.APPLY_BATCH_DETAILS = exports.APPLY_DETAILS = exports.LOAD_DETAILS = undefined;

var _reduxActions = require('redux-actions');

var _seamlessImmutable = require('seamless-immutable');

var _seamlessImmutable2 = _interopRequireDefault(_seamlessImmutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const LOAD_DETAILS = exports.LOAD_DETAILS = 'LOAD_DETAILS';
const APPLY_DETAILS = exports.APPLY_DETAILS = 'APPLY_DETAILS';
const APPLY_BATCH_DETAILS = exports.APPLY_BATCH_DETAILS = 'APPLY_BATCH_DETAILS';

/**
 * 加载详情
 * @param {Object} options
 * @param {string} options.service
 * @param {string} options.model
 * @param {string} options.key
 * @param {string} options.id
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
const applyBatchDetails = exports.applyBatchDetails = (0, _reduxActions.createAction)(APPLY_BATCH_DETAILS, list => ({ list }));

// 初始state
const INITIAL_STATE = exports.INITIAL_STATE = (0, _seamlessImmutable2.default)({});

exports.default = (0, _reduxActions.handleActions)({
  APPLY_DETAILS: (state, { payload }) => {
    let { key, data } = payload;
    let datas = state[key] || (0, _seamlessImmutable2.default)({});
    datas = datas.set(data._id, data);
    return state.set(key, datas);
  },
  APPLY_BATCH_DETAILS: (state, { payload }) => {
    const { list } = payload;
    for (let _ref of list) {
      let { key, data } = _ref;

      let datas = state[key] || (0, _seamlessImmutable2.default)({});
      datas = datas.set(data._id, data);
      state = state.set(key, datas);
    }
    return state;
  },
  LOGOUT: () => INITIAL_STATE
}, INITIAL_STATE);