import { put } from 'redux-saga/effects';
import akita from 'akita';
import { saveFailure, saveSuccess } from '../redux/save';
import { applyDetails, batchApplyDetails } from '../redux/details';
import { clearList } from '../redux/lists';

export default function* saveSaga({ payload }) {
  try {
    let res = yield akita.post('/api/save', {
      params: {
        _service: payload.service,
        _model: payload.model,
      },
      body: payload.data
    });
    yield put(saveSuccess(payload, res));
    if (Array.isArray(res)) {
      // 同时保存了多条记录
      let list = res.map((data) => ({ key: payload.key, data }));
      yield put(batchApplyDetails(list));
    } else {
      // 只保存了一条记录
      yield put(applyDetails(payload.key, res));
      if (!payload.data.id) {
        // 新建，需要清空列表
        yield put(clearList(payload.key));
      }
    }
  } catch (e) {
    yield put(saveFailure(payload, e));
  }
}
