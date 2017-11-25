import { put } from 'redux-saga/effects';
import akita from 'akita';
import { saveFailure, saveSuccess } from '../redux/save';
import { applyDetails } from '../redux/details';
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
    yield put(applyDetails(payload.key, res));
    yield put(clearList(payload.key));
  } catch (e) {
    yield put(saveFailure(payload, e));
  }
}
