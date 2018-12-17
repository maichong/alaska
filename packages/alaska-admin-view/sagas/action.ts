import * as _ from 'lodash';
import { put } from 'redux-saga/effects';
import { Action } from 'redux-actions';
import { actionSuccess, actionFailure } from '../redux/action';
import api from '../utils/api';
import { applyDetails, batchApplyDetails } from '../redux/details';
import { clearList } from '../redux/lists';
import { clearQueryCache } from '../redux/queryCaches';

export default function* action({ payload }: Action<any>) {
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
      let list: any = result.map((data) => ({ model: payload.model, data }));
      yield put(batchApplyDetails(list));
    } else {
      // 只保存了一条记录
      yield put(applyDetails(payload.model, result));
    }
  }
}
