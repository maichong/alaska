// 登录请求 /api/login/login
import { put } from 'redux-saga/effects';
import { loginSuccess, loginFailure } from '../redux/login';
import { refreshSettings } from '../redux/settings';
import akita from 'akita';

export function* login({ payload }) {
  try {
    yield akita.post('/api/login/login', { body: payload });
    yield put(loginSuccess());
    yield put(refreshSettings());
  } catch (e) {
    yield put(loginFailure(e));
  }
}

export function* logout() {
  try {
    yield akita.post('/api/login/logout');
    yield put(refreshSettings());
  } catch (e) {
    throw e;
  }
}
