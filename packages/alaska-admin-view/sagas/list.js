import { put } from 'redux-saga/effects';
import akita from '../utils/akita';
import { listSuccess } from '../redux/lists';

export default function* list(args) {
  try {
    let res = akita.post('/api/list', args);
    yield put(listSuccess(res, args));
  } catch (e) {
    throw e;
  }
}
