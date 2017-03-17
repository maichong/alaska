import { put } from 'redux-saga/effects';
import qs from 'qs';
import akita from 'akita';
import { detailsSuccess } from '../redux/details';

export default function* details(args) {
  try {
    let res = akita.findOne('/api/details?' + qs.stringify(args));
    yield put(detailsSuccess(res));
  } catch (e) {
    throw e;
  }
}
