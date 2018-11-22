import * as _ from 'lodash';
import { put } from 'redux-saga/effects';
import { Action } from 'redux-actions';
import { LoadListPayload } from 'alaska-admin-view';
import { actionSuccess, actionFailure } from '../redux/action';
import api from '../utils/api';
import { applyDetails, batchApplyDetails } from '../redux/details';
import { clearList } from '../redux/lists';

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
  if (payload.action === 'update' || payload.action === 'create') {
    if (Array.isArray(result)) {
      // 同时保存了多条记录
      let list: any = result.map((data) => ({ model: payload.model, data }));
      yield put(batchApplyDetails(list));
    } else {
      // 只保存了一条记录
      yield put(applyDetails(payload.model, result));
      if (payload.body && !payload.body.id) {
        // 新建，需要清空列表
        yield put(clearList(payload));
      }
    }
  } else if (payload.action === 'remove') {
    yield put(clearList({ model: payload.model }));
  }
}
