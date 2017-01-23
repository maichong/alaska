import { put } from 'redux-saga/effects';
import akita from '../utils/akita';
import { detailsSuccess } from '../redux/details';

export default function* details(args) {
  try {
    let res = akita.findOne('/api/details', args);
    yield put(detailsSuccess(res));
  } catch (e) {
    throw e;
  }
}
