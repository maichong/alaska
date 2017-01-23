// 登录请求 /api/login/login
import { put } from 'redux-saga/effects';
import { loginSuccess, loginFailure, logoutSuccess } from '../redux/login';
import akita from '../utils/akita';

export function* login(action) {
  try {
    let res = yield akita.post('/api/login/login', action.payload);
    yield put(loginSuccess(res));
  } catch (e) {
    yield put(loginFailure(e));
  }
}

export function* logout() {
  try {
    yield akita.post('/api/login/logout');
    yield put(logoutSuccess());
  } catch (e) {
    throw e;
  }
}