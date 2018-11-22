/*
 * @Author: Chao
 * @Date: 2018-11-01 12:44:21
 * @Last Modified by: Zhao
 * @Last Modified time: 2018-11-17 13:45:36
 */

import * as _ from 'lodash';
import { put } from 'redux-saga/effects';
import { Action } from 'redux-actions';
import { LoadMorePayload } from 'alaska-admin-view';
import { applyList, loadListFailure } from '../redux/lists';
import api from '../utils/api';
import { getStore } from '../utils/store';
import { State, RecordList } from '..';

export default function* more({ payload }: Action<LoadMorePayload>) {
  let model = payload.model;
  let state: State = getStore() || {} as State;
  let list: RecordList<any> & { sort?: string; filters?: Object; } = null;
  if (state.lists && state.lists[model]) {
    list = state.lists[model];
  }
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
