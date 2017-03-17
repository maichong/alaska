import { put } from 'redux-saga/effects';
import akita from 'akita';
import { applyDetails } from '../redux/details';

export default function* details({ payload }) {
  try {
    let res = yield akita.get('/api/details', {
      params: {
        _service: payload.service,
        _model: payload.model,
        _id: payload.id,
      }
    });
    yield put(applyDetails(payload.key, res));
  } catch (e) {
    throw e;
  }
}
