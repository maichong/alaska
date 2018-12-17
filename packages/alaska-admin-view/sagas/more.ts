/*
 * @Author: Chao
 * @Date: 2018-11-01 12:44:21
 * @Last Modified by: Liang
 * @Last Modified time: 2018-12-18 06:55:17
 */

import * as _ from 'lodash';
import { put } from 'redux-saga/effects';
import { Action } from 'redux-actions';
import { LoadMorePayload } from 'alaska-admin-view';
import { applyList, loadListFailure } from '../redux/lists';
import api from '../utils/api';
import store from '../redux';
import { ListsState, AnyRecordList } from '..';

export default function* more({ payload }: Action<LoadMorePayload>) {
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
