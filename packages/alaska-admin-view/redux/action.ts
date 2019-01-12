import { createAction, handleActions, Action } from 'redux-actions';
import { put } from 'redux-saga/effects';
import * as immutable from 'seamless-immutable';
import * as _ from 'lodash';
import api from '../utils/api';
import { applyDetails, batchApplyDetails } from './details';
import { clearList } from './lists';
import { clearQueryCache } from './queryCaches';
import { ActionState, ActionRequestPayload } from '..';

export const ACTION_REQUEST = 'ACTION_REQUEST';
export const ACTION_SUCCESS = 'ACTION_SUCCESS';
export const ACTION_FAILURE = 'ACTION_FAILURE';

// 初始state
const INITIAL_STATE: ActionState = immutable({
  action: '',
  model: '',
  fetching: false,
  request: '',
  error: null,
  records: [],
  search: '',
  sort: '',
  filters: null,
  body: {},
  result: {}
});

export const actionRequest = createAction<ActionRequestPayload>(ACTION_REQUEST);
export const actionSuccess = createAction<any>(ACTION_SUCCESS);
export const actionFailure = createAction<Error>(ACTION_FAILURE);

export default handleActions({
  ACTION_REQUEST: (state, action) => {
    const payload: ActionRequestPayload = action.payload;
    return INITIAL_STATE.merge(payload).set('fetching', true);
  },
  ACTION_SUCCESS: (state, action) => {
    const payload: any = action.payload;
    return state.merge({ fetching: false, error: null, result: payload });
  },
  ACTION_FAILURE: (state, action) => {
    // @ts-ignore
    const payload: Error = action.payload;
    return state.merge({ fetching: false, error: payload });
  }
}, INITIAL_STATE);

export function* actionSaga({ payload }: Action<any>) {
  let result = [];
  try {
    result = yield api.post('/action',
      {
        query: _.assign({
          _model: payload.model,
          _records: payload.records,
          _action: payload.action,
          _search: payload.search,
          _sort: payload.sort || ''
        }, payload.filters),
        body: payload.body || {}
      });
    yield put(actionSuccess(result));
  } catch (e) {
    yield put(actionFailure(e));
  }
  if (payload.action === 'create' || payload.action === 'remove') {
    // 新建，需要清空列表
    yield put(clearList({ model: payload.model }));
    yield put(clearQueryCache({ model: payload.model }));
  } else if (payload.action === 'update') {
    yield put(clearQueryCache({ model: payload.model }));
    if (Array.isArray(result)) {
      // 同时保存了多条记录
      let list: any = result.map((data) => ({ model: payload.model, data: _.assign(data, { id: data._id, _rev: Date.now() }) }));
      yield put(batchApplyDetails(list));
    } else {
      // 只保存了一条记录
      result.id = result._id;
      result._rev = Date.now();
      yield put(applyDetails(payload.model, result));
    }
  }
}
