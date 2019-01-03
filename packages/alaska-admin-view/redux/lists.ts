import { createAction, handleActions, Action } from 'redux-actions';
import { put } from 'redux-saga/effects';
import * as immutable from 'seamless-immutable';
import * as _ from 'lodash';
import { PaginateResult } from 'akita';
import api from '../utils/api';
import {
  AnyRecordList,
  ListsState,
  ApplyDetailsPayload,
  ClearListPayload,
  LoadListPayload,
  LoadMorePayload,
  ApplyListPayload
} from 'alaska-admin-view';
import store from './index';

export const CLEAR_LIST = 'CLEAR_LIST';
export const LOAD_LIST = 'LOAD_LIST';
export const LOAD_MORE = 'LOAD_MORE';
export const APPLY_LIST = 'APPLY_LIST';
export const LOAD_LIST_FAILURE = 'LOAD_LIST_FAILURE';

/**
 * 清空列表 options
 * @params {string} [options.model] 要清空的列表model，空代表清空全部
 */
export const clearList = createAction<ClearListPayload>(CLEAR_LIST);

/**
 * 加载列表
 * @param {Object} options
 * @param {string} options.model
 * @param {number} options.page
 * @param {Object} options.filters
 * @param {string} options.search
 * @param {string} options.sort
 */
export const loadList = createAction<LoadListPayload>(LOAD_LIST);

/**
 * 加载更多
 * @param {Object} options
 * @param {string} options.model
 */
export const loadMore = createAction<LoadMorePayload>(LOAD_MORE);

/**
 * 加载成功
 * @param {string} model
 * @param {Object} res
 */
export const applyList = createAction<ApplyListPayload, string, PaginateResult<any>>(APPLY_LIST, (model, res) => Object.assign({ model }, res));

/**
 * 加载失败
 * @param {string} model
 * @param {Error} error
 */
export const loadListFailure = createAction(LOAD_LIST_FAILURE, (model: string, error: Error) => ({ model, error }));

// 初始state
const INITIAL_STATE: ListsState = immutable({});

const EMPTY_LIST: AnyRecordList = immutable({
  total: 0,
  page: 1,
  limit: 10,
  totalPage: 1,
  previous: 0,
  next: 0,
  search: '',
  filters: null,
  results: [],
  error: null,
  fetching: false
});

export default handleActions({
  REFRESH: () => INITIAL_STATE,
  LOAD_LIST: (state, action) => {
    // @ts-ignore
    const payload: LoadListPayload = action.payload;
    let list: AnyRecordList = state[payload.model] || EMPTY_LIST;
    list = list.merge(_.assign({}, payload, { fetching: true }));
    return state.set(payload.model, list);
  },
  LOAD_MORE: (state, action) => {
    // @ts-ignore
    const payload: LoadListPayload = action.payload;
    let list: AnyRecordList = state[payload.model] || EMPTY_LIST;
    list = list.merge(_.assign({}, payload, { fetching: true }));
    return state.set(payload.model, list);
  },
  CLEAR_LIST: (state, action) => {
    // @ts-ignore
    const payload: ClearListPayload = action.payload;
    return payload.model ? state.without(payload.model) : INITIAL_STATE;
  },
  APPLY_LIST: (state, action) => {
    // @ts-ignore
    const payload: ApplyListPayload = action.payload;
    let model = payload.model;
    let info = _.omit(payload, 'results');
    let list: AnyRecordList = state[payload.model] || EMPTY_LIST;

    list = list.merge(_.assign({}, info, { error: '', fetching: false }));

    if (payload.page === 1) {
      list = list.set('results', payload.results);
    } else {
      let results = list.results || immutable([]);
      list = list.set('results', results.concat(payload.results));
    }
    return state.set(model, list);
  },
  LOAD_LIST_FAILURE: (state, action) => {
    // @ts-ignore
    const payload: LoadListFailurePayload = action.payload;
    let list: AnyRecordList = state[payload.model] || EMPTY_LIST;
    return state.set(payload.model, list.merge({ error: payload.error.message, fetching: false }));
  },
  APPLY_DETAILS: (state, action) => {
    // @ts-ignore
    const payload: ApplyDetailsPayload = action.payload;
    let { model, data } = payload;
    if (!_.isArray(data)) return state;
    let list: AnyRecordList = state[model];
    if (!list) return;
    let found = false;
    let results = _.map(list.results, (record) => {
      if (record._id === data._id) {
        found = true;
        return record.merge(data);
      }
      return record;
    });
    if (!found) return;
    list = list.set('results', results);
    state = state.set(model, list);
    return state;
  },
  BATCH_APPLY_DETAILS: (state, action) => {
    // @ts-ignore
    const payload: ApplyDetailsPayload[] = action.payload;

    function forEach(item: ApplyDetailsPayload) {
      let { model, data } = item;
      let list: AnyRecordList = state[model];
      if (!list) return;
      let found = false;
      let results = _.map(list.results, (record) => {
        if (record._id === data._id) {
          found = true;
          return record.merge(data);
        }
        return record;
      });
      if (!found) return;
      list = list.set('results', results);
      state = state.set(model, list);
    }
    if (_.isArray(payload)) {
      _.forEach(payload, forEach);
    }
    return state;
  },
  LOGOUT: () => INITIAL_STATE
}, INITIAL_STATE);

export function* listSaga({ payload }: Action<LoadListPayload>) {
  try {
    let res = yield api.get('/list',
      {
        query: _.assign({
          _model: payload.model,
          _search: payload.search,
          _limit: payload.limit || 50,
          _page: payload.page || 1,
          _sort: payload.sort || ''
        }, payload.filters)
      });
    yield put(applyList(payload.model, res));
  } catch (e) {
    yield put(loadListFailure(payload.model, e));
  }
}

export function* moreSaga({ payload }: Action<LoadMorePayload>) {
  let model = payload.model;
  let lists: ListsState = store.getState().lists;
  let list: AnyRecordList = lists[model];
  if (!list) return;
  try {
    let res = yield api.get('/list',
      {
        query: _.assign({
          _model: payload.model,
          _search: list.search,
          _limit: list.limit || 30,
          _page: list.page + 1,
          _sort: list.sort || ''
        }, list.filters)
      });
    yield put(applyList(payload.model, res));
  } catch (e) {
    yield put(loadListFailure(payload.model, e));
  }
}
