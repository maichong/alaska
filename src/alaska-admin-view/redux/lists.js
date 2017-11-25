import { createAction, handleActions } from 'redux-actions';
import immutable from 'seamless-immutable';
import _ from 'lodash';

export const CLEAR_LIST = 'CLEAR_LIST';
export const LOAD_LIST = 'LOAD_LIST';
export const APPLY_LIST = 'APPLY_LIST';
export const LOAD_LIST_FAILURE = 'LOAD_LIST_FAILURE';

/**
 * 清空列表 action
 * @params {string} key 要清空的列表key，空代表清空全部
 */
export const clearList = createAction(CLEAR_LIST, (key) => ({ key }));

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
export const loadList = createAction(LOAD_LIST);
/**
 * 加载成功
 * @param {string} key
 * @param {Object} res
 */
export const applyList = createAction(APPLY_LIST, (key, res) => Object.assign({ key }, res));
/**
 * 加载失败
 * @param {string} key
 * @param {Error} error
 */
export const loadListFailure = createAction(LOAD_LIST_FAILURE, (key, error) => ({ key, error }));

// 初始state
export const INITIAL_STATE = immutable({});

export default handleActions({
  CLEAR_LIST: (state, { payload }) => (payload.key ? state.without(payload.key) : INITIAL_STATE),
  APPLY_LIST: (state, { payload }) => {
    let key = payload.key;
    let info = _.omit(payload, 'results');
    let list = state[payload.key] || immutable({});

    list = list.merge(info);
    list = list.set('error', '');

    if (payload.page === 1) {
      list = list.set('results', payload.results);
    } else {
      let results = list.results || immutable([]);
      list = list.set('results', results.concat(payload.results));
    }
    return state.set(key, list);
  },
  LOAD_LIST_FAILURE: (state, { payload }) => {
    let list = state[payload.key] || immutable({});
    return state.set(payload.key, list.set('error', payload.error.message));
  },
  LOGOUT: () => INITIAL_STATE
}, INITIAL_STATE);
