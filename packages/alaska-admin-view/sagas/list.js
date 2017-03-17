import { put } from 'redux-saga/effects';
import qs from 'qs';
import akita from 'akita';
import { listSuccess } from '../redux/lists';

export default function* list(args) {
  try {
    let res = akita.post('/api/list?' + qs.stringify(args));
    yield put(listSuccess(res, args));
  } catch (e) {
    throw e;
  }
}
