import { put } from 'redux-saga/effects';
import qs from 'qs';
import _ from 'lodash';
import { saveFailure, saveSuccess } from '../redux/save';
import akita from '../utils/akita';

export default function* save(action) {
  try {
    let res = akita.post('/api/save?' + qs.stringify(_.omit(action.payload, 'data')), action.payload.data);
    yield put(saveSuccess(res));
  } catch (e) {
    yield put(saveFailure(e));
  }
}
