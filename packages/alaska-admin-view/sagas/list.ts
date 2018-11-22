import * as _ from 'lodash';
import { put } from 'redux-saga/effects';
import { Action } from 'redux-actions';
import { LoadListPayload } from 'alaska-admin-view';
import { applyList, loadListFailure } from '../redux/lists';
import api from '../utils/api';

export default function* list({ payload }: Action<LoadListPayload>) {
  try {
    let res = yield api.get('/list',
      {
        query: _.assign({
          _model: payload.model,
          _search: payload.search,
          _limit: payload.limit || 30,
          _page: payload.page || 1,
          _sort: payload.sort || ''
        }, payload.filters)
      });
    yield put(applyList(payload.model, res));
  } catch (e) {
    yield put(loadListFailure(payload.model, e));
  }
}
