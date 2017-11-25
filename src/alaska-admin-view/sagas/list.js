import { put } from 'redux-saga/effects';
import akita from 'akita';
import { applyList, loadListFailure } from '../redux/lists';

export default function* list({ payload }) {
  try {
    let res = yield akita('/api/list')
      .find(payload.filters)
      .param('service', payload.service)
      .param('model', payload.model)
      .search(payload.search)
      .sort(payload.sort)
      .limit(payload.limit)
      .page(payload.page);
    yield put(applyList(payload.key, res));
  } catch (e) {
    yield put(loadListFailure(payload.key, e));
  }
}
