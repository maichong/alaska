// 登录请求 /api/login/login
import { put } from 'redux-saga/effects';
import { loginSuccess, loginFailure } from '../redux/login';
import akita from 'akita';

export function* login({ payload }) {
  try {
    yield akita.post('/api/login/login', { body: payload });
    yield put(loginSuccess());
  } catch (e) {
    yield put(loginFailure(e));
  }
}

export function* logout() {
  try {
    yield akita.post('/api/login/logout');
  } catch (e) {
    throw e;
  }
}
