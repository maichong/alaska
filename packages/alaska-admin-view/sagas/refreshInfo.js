// /api/login/info
import { put } from 'redux-saga/effects';
import akita from 'akita';
import { refreshSuccess } from '../redux/user';


export default function* refreshInfo() {
  try {
    let res = akita.post('/api/login/info');
    yield put(refreshSuccess(res));
  } catch (e) {
    throw e;
  }
}
