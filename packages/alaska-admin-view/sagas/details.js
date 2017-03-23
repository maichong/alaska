import { put } from 'redux-saga/effects';
import akita from 'akita';
import { applyDetails } from '../redux/details';

const fetching = {};

export default function* details({ payload }) {
  let fetchingKey = payload.key + '/' + payload.id;
  try {
    if (fetching[fetchingKey]) {
      return;
    }
    fetching[fetchingKey] = true;
    let res = yield akita.get('/api/details', {
      params: {
        _service: payload.service,
        _model: payload.model,
        _id: payload.id,
      }
    });
    fetching[fetchingKey] = false;
    yield put(applyDetails(payload.key, res));
  } catch (e) {
    fetching[fetchingKey] = false;
    yield put(applyDetails(payload.key, {
      _id: payload.id,
      _error: e.message
    }));
    throw e;
  }
}
