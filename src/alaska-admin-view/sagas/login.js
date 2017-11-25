// 登录请求 /api/login/login
import { put } from 'redux-saga/effects';
import akita from 'akita';
import { loginSuccess, loginFailure } from '../redux/login';
import { refreshSettings } from '../redux/settings';

export function* login({ payload }) {
  try {
    yield akita.post('/api/login/login', { body: payload });
    yield put(loginSuccess());
    yield put(refreshSettings());
  } catch (e) {
    console.error(e);
    yield put(loginFailure(e));
  }
}

export function* logout() {
  try {
    yield akita.post('/api/login/logout');
    yield put(refreshSettings());
  } catch (e) {
    console.error(e);
  }
}
